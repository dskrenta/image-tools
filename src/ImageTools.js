import React from 'react';
import PropTypes from 'prop-types';
import {observable, computed} from 'mobx';
import {observer} from 'mobx-react';

import ReactCrop from './ReactCrop';
import {
  convertCropScale,
  convertPercentToPixel,
  convertPixelToPercent,
  parseSpec,
  parseCrop,
  calculateCropValues
} from './utils';
import './ImageTools.css';

@observer
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

  static getPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  static createReference(element) {
    return {
      element: element,
      position: ImageTools.getPosition(element)
    };
  }

  static imageHost = 'https://proxy.topixcdn.com/ipicimg/';
  static defaultGravity = {x: 0, y: 0, scale: 1};
  static defaultValues = {brt: 100, sat: 100, con: 0};
  static defaultCrop = {x: 10, y: 10, width: 80, height: 80, aspect: 4/2};
  static defaultGravityStyle = {left: 100, top: 100};

  id;
  @observable values;
  @observable gravity;
  @observable crop;
  @observable pixelCrop;
  @observable gravityStyle;

  constructor(props) {
    super(props);

    this.id = this.props.id;
    this.values = parseSpec(this.props.editSpec, ImageTools.defaultValues);
    this.gravity = ImageTools.defaultGravity;
    this.crop = ImageTools.defaultCrop;
    this.gravityStyle = ImageTools.defaultGravityStyle;

    this.cropTool = this.props.partnerCrops ? this.props.partnerCrops : false;
    this.imageLoaded = new Promise((resolve, reject) => {
      this.imageLoadedResolve = resolve;
      this.imageLoadedReject = reject;
    });
    this.editSpecPattern();
  }

  @computed get imageStyle() {
    return {
      filter: `brightness(${this.values.brt}%) ` +
      `saturate(${this.values.sat}%) ` +
      `contrast(${100 + parseInt(this.values.con, 10)}%)`
    };
  }

  @computed get editSpec() {
    return `brt${this.values.brt}` +
    `-sat${this.values.sat}` +
    `-con${this.values.con}x${100 - this.values.con}`;
  }

  setImagePosition = (element) => {
    this.previewImage = ImageTools.createReference(element);
  };

  setIndicatorPosition = (element) => {
    this.previewIndicator = ImageTools.createReference(element);
  };

  valuesDisplay() {
    if (this.pixelCrop && this.crop) {
      return (
        <h3>{this.pixelCrop.width} x {this.pixelCrop.height}, {this.crop.aspect.toFixed(2)}</h3>
      );
    }
  }

  scaleDisplay() {
    if (this.cropTool) {
      return (
        <div>
          <label>Scale {Math.round(this.gravity.scale * 100)}%</label>
          <input onChange={this.updateScale} type="range" value={this.gravity.scale * 100} max="500" min="100"></input>
        </div>
      );
    }
  }

  imageDisplay() {
    if (this.cropTool) {
      return (
        <div>
          <img
            className="image" ref={this.setImagePosition} src={`${ImageTools.imageHost}${this.id}`}
            onClick={this.updateGravityPosition} style={this.imageStyle} alt="preview"
          />
          <span
            className="indicator" ref={this.setIndicatorPosition}
            onClick={this.updateGravityPosition} style={this.gravityStyle}>X
          </span>
        </div>
      );
    } else {
      return (
        <ReactCrop
          className="preview-image" onImageLoaded={this.onImageLoaded}
          src={`${ImageTools.imageHost}${this.id}`}
          crop={this.crop} onChange={this.cropUpdate}
          style={this.imageStyle}
        />
      );
    }
  }

  async editSpecPattern() {
    try {
      await this.imageLoaded;
      const cropObj = parseCrop(this.props.editSpec);
      if (cropObj) {
        const convertedCrop = convertCropScale(cropObj, this.imageDimensions.natural, this.imageDimensions.display, this.props.aspectLock);
        const convertedCropValues = convertPixelToPercent(convertedCrop, this.imageDimensions.display, this.props.aspectLock);
        this.crop = convertedCropValues;
      }
    } catch (err) {
      console.error(err);
    }
  }

  updateValues = (event) => {
    const value = event.target.value;
    const type = event.target.dataset.type;
    const values = this.values;
    values[type] = value;
    this.values = values;
  }

  updateScale = (event) => {
    const value = event.target.value;
    const gravityObj = this.gravity;
    gravityObj.scale = value / 100;
    this.gravity = gravityObj;
    this.finalCrops = calculateCropValues(this.props.partnerCrops, this.previewImage, this.gravity);
  }

  cropUpdate = (crop, pixelCrop) => {
    pixelCrop.aspect = this.props.aspectLock ? crop.aspect : undefined;
    this.pixelCrop = pixelCrop;
    this.crop = crop;
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
    this.pixelCrop = pixelCrop;
    this.imageLoadedResolve();
  }

  updateGravityPosition = (event) => {
    event.persist();
    const gravityObj = this.gravity;
    gravityObj.x = event.clientX - this.previewImage.position.x;
    gravityObj.y = event.clientY - this.previewImage.position.y + (event.pageY - event.clientY);
    this.gravity = gravityObj;
    this.gravityStyle = {left: event.pageX, top: event.pageY};
    this.finalCrops = calculateCropValues(this.props.partnerCrops, this.previewImage, this.gravity);
  }

  reset = () => {
    this.values = ImageTools.defaultValues;
    this.gravity = ImageTools.defaultGravity;
    this.gravityStyle = ImageTools.defaultGravityStyle;
  }

  done = () => {
    this.props.cb(this.cropTool ? this.finalCrops : this.createFinalEditSpec());
  }

  createFinalEditSpec() {
    let cropParam = '';
    if (this.imageDimensions && this.crop) {
      const convertedCropValues = convertPercentToPixel(this.crop, this.imageDimensions.display);
      const naturalCrop = convertCropScale(convertedCropValues, this.imageDimensions.display, this.imageDimensions.natural);
      cropParam = `-cp${naturalCrop.x}x${naturalCrop.y}x${naturalCrop.width + naturalCrop.x}x${naturalCrop.height + naturalCrop.y}`;
    }
    return `brt${this.values.brt}-sat${this.values.sat}-con${this.values.con}x${100 - this.values.con}${cropParam}`;
  }

  render() {
    return (
      <div className="test-margin">
       <div className="image-tools" ref={this.setContainerPosition}>
         <div className="menu">
           <div className="content-wrap">
             {this.valuesDisplay()}
             <div>
               <label>Brightness {this.values.brt}%</label>
               <input type="range" data-type="brt" onChange={this.updateValues} value={this.values.brt} min="100" max="300"></input>
               <label>Saturation {this.values.sat}%</label>
               <input type="range" data-type="sat" onChange={this.updateValues} value={this.values.sat} min="100" max="300"></input>
               <label>Contrast {this.values.con}%</label>
               <input type="range" data-type="con" onChange={this.updateValues} value={this.values.con} min="0" max="50"></input>
             </div>
             {this.scaleDisplay()}
             <button onClick={this.reset}>Reset</button>
             <button onClick={this.done}>Done</button>
           </div>
         </div>
         {this.imageDisplay()}
       </div>
     </div>
    );
  }
}
