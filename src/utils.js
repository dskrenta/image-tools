export function convertCropScale(crop, baseDimensions, newDimensions, aspectLock) {
  return {
    x: Math.round((crop.x / baseDimensions.width) * newDimensions.width),
    y: Math.round((crop.y / baseDimensions.height) * newDimensions.height),
    width: Math.round((crop.width / baseDimensions.width) * newDimensions.width),
    height: Math.round((crop.height / baseDimensions.height) * newDimensions.height),
    aspect: aspectLock ? (crop.width / crop.height) : undefined
  };
}

export function convertPercentToPixel(crop, baseDimensions, aspectLock) {
  return {
    x: (crop.x / 100) * baseDimensions.width,
    y: (crop.y / 100) * baseDimensions.height,
    width: (crop.width / 100) * baseDimensions.width,
    height: (crop.height / 100) * baseDimensions.height,
    aspect: aspectLock ? (crop.width / crop.height) : undefined
  };
}

export function convertPixelToPercent(crop, baseDimensions, aspectLock) {
  return {
    x: (crop.x / baseDimensions.width) * 100,
    y: (crop.y / baseDimensions.height) * 100,
    width: (crop.width / baseDimensions.width) * 100,
    height: (crop.height / baseDimensions.height) * 100,
    aspect: aspectLock ? (crop.width / crop.height) : undefined
  };
}

export function parseSpec(spec, defaultValues) {
  return {
    brt: parseInt(spec.match(/brt(\d+)/)[1], 10) || defaultValues.brt,
    sat: parseInt(spec.match(/sat(\d+)/)[1], 10) || defaultValues.sat,
    con: parseInt(spec.match(/con(\d+)/)[1], 10) || defaultValues.con
  };
}

export function parseCrop(spec, aspectLock) {
  const match = spec.match(/cp(.*)/);
  if (match) {
    const values = match[1].split('x').map(value => parseInt(value, 10));
    const crop = {
      x: values[0],
      y: values[1],
      width: values[2] - values[0],
      height: values[3] - values[1]
    };
    crop.aspect = aspectLock ? (crop.width / crop.height) : undefined;
    return crop;
  } else {
    return undefined;
  }
}

export function calculateCropValues(partnerCrops, previewImage, gravity) {
  return partnerCrops.map(crop => {
    crop.aspect = crop.width / crop.height;
    let cWidth = 0;
    let cHeight = 0;
    let resizeWidth = previewImage.element.naturalWidth;
    let resizeHeight = previewImage.element.naturalHeight;
    const baseImageAspect = resizeWidth / resizeHeight;

    if (baseImageAspect > 1) {
      cHeight = resizeHeight;
      cWidth = Math.round(crop.aspect * cHeight);

      let oversizeScale = cWidth / resizeWidth;
      if (oversizeScale > 1) {
        cHeight = resizeHeight / oversizeScale;
        cWidth = Math.round(crop.aspect * cHeight);
      }
    } else {
      cWidth = resizeWidth;
      cHeight = Math.round(cWidth / crop.aspect);

      let oversizeScale = cHeight / resizeHeight;
      if (oversizeScale > 1) {
        cWidth = resizeWidth / oversizeScale;
        cHeight = Math.round(cWidth / crop.aspect);
      }
    }

    let gX = Math.round((gravity.x / previewImage.element.clientWidth) * resizeWidth);
    let gY = Math.round((gravity.y / previewImage.element.clientHeight) * resizeHeight);

    let cX = Math.round(gX * gravity.scale) - (0.5 * cWidth);
    let cY = Math.round(gY * gravity.scale) - (0.5 * cHeight);

    resizeWidth = Math.round(resizeWidth * gravity.scale);
    resizeHeight = Math.round(resizeHeight * gravity.scale);

    if (cX < 0 ) {
      cX = 0;
    } else if (cX > (resizeWidth - cWidth)) {
      cX = Math.round(resizeWidth - cWidth);
    }

    if (cY < 0) {
      cY = 0;
    } else if (cY > (resizeHeight - cHeight)) {
      cY = Math.round(resizeHeight - cHeight);
    }

    cWidth += cX;
    cHeight += cY;

    const scaled = convertCropScale(
      {
        x: cX,
        y: cY,
        width: cWidth,
        height: cHeight
      },
      {
        width: resizeWidth,
        height: resizeHeight
      },
      {
        width: this.previewImage.element.naturalWidth,
        height: this.previewImage.element.naturalHeight
      }
    );
    const cropSpec = `cp${scaled.x}x${scaled.y}x${scaled.width}x${scaled.height}`;

    return cropSpec;
  });
}
