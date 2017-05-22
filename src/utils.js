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

export function parseCrop(spec) {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
}
