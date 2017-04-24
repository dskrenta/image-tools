import React from 'react';
import PropTypes from 'prop-types';
import './ImageTools.css';
import ReactCrop from './ReactCrop';

/*
  TODO:
    - add option to lock or unlock aspect ratio
    - change state values from prop edit spec
    - take values from edit spec when in crop-tool mode
    - allow adjustments to automatic crop by clicking on display crop (preview)
*/

export default class ImageTools extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    cb: PropTypes.func.isRequired,
    aspectLock: PropTypes.bool,
    editSpec: PropTypes.string,
    partnerCrops: PropTypes.arrayOf(PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired
    }))
  };

  static defaultProps = {
    aspectLock: false,
    editSpec: 'brt100-sat100-con0x100'
  };

  static convertCropScale(crop, baseDimensions, newDimensions) {
    return {
      x: Math.round((crop.x / baseDimensions.width) * newDimensions.width),
      y: Math.round((crop.y / baseDimensions.height) * newDimensions.height),
      width: Math.round((crop.width / baseDimensions.width) * newDimensions.width),
      height: Math.round((crop.height / baseDimensions.height) * newDimensions.height),
      aspect: crop.width / crop.height
    };
  }

  static convertPercentToPixel(crop, baseDimensions) {
    return {
      x: (crop.x / 100) * baseDimensions.width,
      y: (crop.y / 100) * baseDimensions.height,
      width: (crop.width / 100) * baseDimensions.width,
      height: (crop.height / 100) * baseDimensions.height,
      aspect: crop.width / crop.height
    };
  }

  static convertPixelToPercent(crop, baseDimensions) {
    return {
      x: (crop.x / baseDimensions.width) * 100,
      y: (crop.y / baseDimensions.height) * 100,
      width: (crop.width / baseDimensions.width) * 100,
      height: (crop.height / baseDimensions.height) * 100,
      aspect: crop.width / crop.height
    };
  }

  static getPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  static imageHost = 'https://proxy.topixcdn.com/ipicimg/';
  static defaultValues = {brt: 100, sat: 100, con: 0};
  static defaultGravity = {x: 0, y: 0, scale: 1};
  static defaultCrop = {x: 10, y: 10, width: 80, height: 80, aspect: 4/2};

  constructor(props) {
    super(props);
    this.state = {
      values: ImageTools.defaultValues,
      gravity: ImageTools.defaultGravity,
      crop: ImageTools.defaultCrop,
      editSpec: this.parseEditSpec(this.props.editSpec),
      id: this.props.id,
      displayCrops: null
    };
    this.baseResetCrop = ImageTools.defaultCrop;
    this.aspectLock = this.props.aspectLock;
    this.cropTool = this.props.partnerCrops ? this.props.partnerCrops : false;
    this.imageLoaded = new Promise((resolve, reject) => {
      this.imageLoadedResolve = resolve;
      this.imageLoadedReject = reject;
    });
    this.editSpecPattern();
  }

  cropDisplay() {
    if (this.state.displayCrops && this.cropTool) {
      return (
        <div className="display-crop-container">
          {this.state.displayCrops.map((imageUrl, index) => {
            return <img className="display-crop" key={index} src={imageUrl} style={this.generateImageStyle()} alt="display-crop" />;
          })}
        </div>
      );
    }
  }

  imageDisplay() {
    if (this.cropTool) {
      const indicatorStyle = {
        left: this.state.gravity.x,
        top: this.state.gravity.y
      };
      return (
        <div className="master-crop">
          <img
            className="image" ref={this.setImagePosition} src={`${ImageTools.imageHost}${this.state.id}`}
            onClick={this.updateGravityPosition} style={this.generateImageStyle()} alt="preview"
          />
          <span
            className="indicator" ref={this.setIndicatorPosition}
            onClick={this.updateGravityPosition} style={indicatorStyle}>X
          </span>
        </div>
      );
    } else {
      return (
        <ReactCrop
          className="preview-image" onImageLoaded={this.onImageLoaded}
          src={`${ImageTools.imageHost}${this.state.id}`}
          crop={this.state.crop} onChange={this.cropUpdate} style={this.generateImageStyle()}
        />
      );
    }
  }

  generateImageStyle() {
    return {
      filter: `brightness(${this.state.values.brt}%) saturate(${this.state.values.sat}%) contrast(${100 + parseInt(this.state.values.con, 10)}%)`
    };
  }

  calculateCropValues() {
    this.finalCrops = this.cropTool.map(crop => {
      crop.aspect = crop.width / crop.height;
      let cWidth = 0;
      let cHeight = 0;
      let resizeWidth = this.previewImage.element.naturalWidth;
      let resizeHeight = this.previewImage.element.naturalHeight;
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

      let gX = Math.round((this.state.gravity.x / this.previewImage.element.clientWidth) * resizeWidth);
      let gY = Math.round((this.state.gravity.y / this.previewImage.element.clientHeight) * resizeHeight);

      let cX = Math.round(gX * this.state.gravity.scale) - (0.5 * cWidth);
      let cY = Math.round(gY * this.state.gravity.scale) - (0.5 * cHeight);

      resizeWidth = Math.round(resizeWidth * this.state.gravity.scale);
      resizeHeight = Math.round(resizeHeight * this.state.gravity.scale);

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

      const scaled = ImageTools.convertCropScale(
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
    this.generateDisplayCrops(this.finalCrops);
    console.log(this.finalCrops);
  }

  generateDisplayCrops(specs) {
    this.setState({displayCrops: specs.map(spec => `${ImageTools.imageHost}${this.state.id}-${spec}`)});
  }

  setImagePosition = (event) => {
    this.previewImage = ImageTools.createReference(event);
  };

  setIndicatorPosition = (event) => {
    this.previewIndicator = ImageTools.createReference(event);
  };

  static createReference(element) {
    return {
      element: element,
      position: ImageTools.getPosition(element)
    };
  }

  scaleDisplay() {
    if (this.cropTool) {
      return (
        <div>
          <label>Scale {Math.round(this.state.gravity.scale * 100)}%</label>
          <input onChange={this.updateScale} type="range" value={this.state.gravity.scale * 100} max="500" min="100"></input>
        </div>
      );
    }
  }

  updateScale = (event) => {
    const value = event.target.value;
    const gravityObj = this.state.gravity;
    gravityObj.scale = value / 100;
    this.setState({gravity: gravityObj});
    this.calculateCropValues();
  };

  updateGravityPosition = (event) => {
    event.persist();
    const gravityObj = this.state.gravity;
    gravityObj.x = event.clientX;
    gravityObj.y = event.clientY;
    this.setState({gravity: gravityObj});
    this.calculateCropValues();
  };

  async editSpecPattern () {
    try {
      if (this.cropValuesSpec) {
        await this.imageLoaded;
        let propCropObj = this.parseCrop(this.cropValuesSpec);
        const convertedCrop = ImageTools.convertCropScale(propCropObj, this.imageDimensions.natural, this.imageDimensions.display);
        const convertedCropValues = ImageTools.convertPixelToPercent(convertedCrop, this.imageDimensions.display);
        this.baseResetCrop = convertedCropValues;
        this.setState({crop: convertedCropValues});
      }
    } catch (err) {
      console.error(err);
    }
  }

  parseEditSpec(editSpec) {
    let cpIndex = null;
    const specs = editSpec.split('-');
    const returnSpec = specs.filter(spec => {
      if (spec.startsWith('cp')) {
        cpIndex = specs.indexOf(spec);
        return false;
      } else {
        return true;
      }
    }).join('-');
    this.cropValuesSpec = specs[cpIndex];
    return returnSpec;
  }

  parseCrop(cropSpec) {
    let values = Array.from(cropSpec).slice(2).join('').split('x');
    return {
      x: values[0],
      y: values[1],
      width: values[2] - values[0],
      height: values[3] - values[1]
    };
  }

  onImageLoaded = (crop, image, pixelCrop) => {
    this.imageDimensions = {
      natural: {
        width: image.naturalWidth,
        height: image.naturalHeight
      },
      display: {
        width: image.clientWidth,
        height: image.clientHeight
      },
      aspect: image.clientWidth / image.clientHeight
    }
    this.imageLoadedResolve();
    this.setState({pixelCrop: pixelCrop});
  };

  valuesDisplay() {
    if (this.state.pixelCrop && this.state.crop.aspect) {
      return (
        <h3>{this.state.pixelCrop.width} x {this.state.pixelCrop.height}, {this.state.crop.aspect.toFixed(2)}</h3>
      );
    }
  }

  cropUpdate = (crop, pixelCrop) => {
    this.setState({
      pixelCrop: {
        x: pixelCrop.x,
        y: pixelCrop.y,
        width: pixelCrop.width,
        height: pixelCrop.height,
        aspect: crop.aspect
      }
    });
    this.setState({crop: crop});
  };

  reset = (event) => {
    this.setState({crop: this.baseResetCrop});
    this.updateEditSpec();
  };

  done = (event) => {
    this.props.cb(this.cropTool ? this.finalCrops : this.createFinalEditSpec());
  };

  createFinalEditSpec() {
    let cropParam = '';
    if (this.imageDimensions && this.state.crop) {
      const convertedCropValues = ImageTools.convertPercentToPixel(this.state.crop, this.imageDimensions.display);
      const naturalCrop = ImageTools.convertCropScale(convertedCropValues, this.imageDimensions.display, this.imageDimensions.natural);
      cropParam = `-cp${naturalCrop.x}x${naturalCrop.y}x${naturalCrop.width + naturalCrop.x}x${naturalCrop.height + naturalCrop.y}`;
    }
    return `brt${this.state.values.brt}-sat${this.state.values.sat}-con${this.state.values.con}x${100 - this.state.values.con}${cropParam}`;
  }

  updateEditSpec = (values = {brt: 100, sat: 100, con: 0}) => {
    const editSpec = `brt${values.brt}-sat${values.sat}-con${values.con}x${100 - values.con}`;
    this.setState({values: values, editSpec: editSpec});
  };

  updateValues = (event) => {
    const value = event.target.value;
    const type = event.target.dataset.type;
    const values = this.state.values;
    values[type] = value;
    this.updateEditSpec(values);
  };

  render() {
    return (
      <div className="image-tools">
        <div className="menu">
          <div className="content-wrap">
            {this.valuesDisplay()}
            <div>
              <label>Brightness {this.state.values.brt}%</label>
              <input type="range" data-type="brt" onChange={this.updateValues} value={this.state.values.brt} min="100" max="300"></input>
              <label>Saturation {this.state.values.sat}%</label>
              <input type="range" data-type="sat" onChange={this.updateValues} value={this.state.values.sat} min="100" max="300"></input>
              <label>Contrast {this.state.values.con}%</label>
              <input type="range" data-type="con" onChange={this.updateValues} value={this.state.values.con} min="0" max="50"></input>
            </div>
            {this.scaleDisplay()}
            <button onClick={this.reset}>Reset</button>
            <button onClick={this.done}>Done</button>
          </div>
        </div>
        {this.imageDisplay()}
        {this.cropDisplay()}
      </div>
    );
  }
}
