import React from 'react';
import './ImageEditor.css';
import ReactCrop from 'react-image-crop';
import PropTypes from 'prop-types';

const DEFAULT_CROP = {
  x: 10,
  y: 10,
  width: 80,
  height: 50,
  aspect: 16/9
};
const DEFAULT_VALUES = {
  brt: 100,
  sat: 100,
  con: 0
};
const DEFAULT_EDIT_SPEC = 'brt100-sat100-con0x100';

export default class ImageTools extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: DEFAULT_VALUES,
      crop: DEFAULT_CROP,
      editSpec: this.parseEditSpec(this.props.editSpec) || DEFAULT_EDIT_SPEC,
      id: this.props.id
    };
    this.baseResetCrop = DEFAULT_CROP;
    this.imageLoadedResolve = null;
    this.imageLoadedReject = null;
    this.imageLoaded = new Promise((resolve, reject) => {
      this.imageLoadedResolve = resolve;
      this.imageLoadedReject = reject;
    });
    this.editSpecPattern();
  }

  render() {
    return (
      <div className="image-tools">
        <ReactCrop
          className="preview-image" onImageLoaded={this.onImageLoaded}
          src={`http://proxy.topixcdn.com/ipicimg/${this.state.id}-${this.state.editSpec}`}
          crop={this.state.crop} onChange={this.cropUpdate}
        />
        <div className="menu">
          <div className="content-wrap">
            {this.valuesDisplay()}
            <form onChange={this.updateValues}>
              <div>
                <input type="range" data-type="brt" value={this.state.values.brt} min="100" max="300"></input>
                <label>Brightness {this.state.values.brt}%</label>
              </div>
              <div>
                <input type="range" data-type="sat" value={this.state.values.sat} min="100" max="300"></input>
                <label>Saturation {this.state.values.sat}%</label>
              </div>
              <div>
                <input type="range" data-type="con" value={this.state.values.con} min="0" max="50"></input>
                <label>Contrast {this.state.values.con}%</label>
              </div>
            </form>
            <button onClick={this.reset}>Reset</button>
            <button onClick={this.done}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  async editSpecPattern () {
    try {
      if (this.cropValuesSpec) {
        // minus x and y out of crop width and height from prop editSpec
        let imageDimensions = await this.imageLoaded;
        let propCropObj = this.parseCrop(this.cropValuesSpec);
        // const convertedCrop = this.convertCrop(propCropObj, imageDimensions);
        // converting natural crop to display crop
        const convertedCrop = this.convertCropScale(
          propCropObj,
          {
            width: imageDimensions.naturalWidth,
            height: imageDimensions.naturalHeight
          },
          {
            width: imageDimensions.width,
            height: imageDimensions.height
          }
        );
        const convertedCropValues = this.convertPixPer(
          convertedCrop,
          {
            width: imageDimensions.width,
            height: imageDimensions.height
          }
        );
        console.log(convertedCropValues);
        this.baseResetCrop = convertedCropValues;
        this.setState({crop: convertedCropValues});
        this.setState(this.state);
      }
    } catch (err) {
      console.error(err);
    }
  }

  convertCropScale(crop, baseDimensions, newDimensions) {
    return {
      x: Math.round((crop.x / baseDimensions.width) * newDimensions.width),
      y: Math.round((crop.y / baseDimensions.height) * newDimensions.height),
      width: Math.round((crop.width / baseDimensions.width) * newDimensions.width),
      height: Math.round((crop.height / baseDimensions.height) * newDimensions.height),
      // aspect: crop.width / crop.height
    };
  }

  convertPerPix(crop, baseDimensions) {
    return {
      x: (crop.x / 100) * baseDimensions.width,
      y: (crop.y / 100) * baseDimensions.height,
      width: (crop.width / 100) * baseDimensions.width,
      height: (crop.height / 100) * baseDimensions.height,
      // aspect: crop.width / crop.height
    };
  }

  convertPixPer(crop, baseDimensions) {
    return {
      x: (crop.x / baseDimensions.width) * 100,
      y: (crop.y / baseDimensions.height) * 100,
      width: (crop.width / baseDimensions.width) * 100,
      height: (crop.height / baseDimensions.height) * 100,
      // aspect: crop.width / crop.height
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
      width: values[2],
      height: values[3]
    };
  }

  onImageLoaded = (crop, image, pixelCrop) => {
    this.imageDimensions = {
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      width: image.clientWidth,
      height: image.clientHeight,
      aspect: image.clientWidth / image.clientHeight
    };
    this.imageLoadedResolve(this.imageDimensions);
    this.setState({pixelCrop: pixelCrop});
  }

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
  }

  reset = (event) => {
    this.setState({crop: this.baseResetCrop});
    this.updateEditSpec();
  }

  done = (event) => {
    this.props.cb(this.createFinalEditSpec());
  }

  createFinalEditSpec() {
    let cropParam = '';
    if (this.imageDimensions && this.state.crop) {
      const baseDimensions = {
        width: this.imageDimensions.width,
        height: this.imageDimensions.height
      };
      const convertedCropValues = this.convertPerPix(this.state.crop, baseDimensions);
      const naturalCrop = this.convertCropScale(
        convertedCropValues,
        baseDimensions,
        {
          width: this.imageDimensions.naturalWidth,
          height: this.imageDimensions.naturalHeight
        }
      );
      cropParam = `-cp${naturalCrop.x}x${naturalCrop.y}x${naturalCrop.width + naturalCrop.x}x${naturalCrop.height + naturalCrop.y}`;
    }
    return `brt${this.state.values.brt}-sat${this.state.values.sat}-con${this.state.values.con}x${100 - this.state.values.con}${cropParam}`;
  }

  updateEditSpec = (values = {brt: 100, sat: 100, con: 0}) => {
    const editSpec = `brt${values.brt}-sat${values.sat}-con${values.con}x${100 - values.con}`;
    this.setState({values: values, editSpec: editSpec});
  }

  updateValues = (event) => {
    const value = event.target.value;
    const type = event.target.dataset.type;
    const values = this.state.values;
    values[type] = value;
    this.updateEditSpec(values);
  }
}

ImageTools.propTypes = {
  id: PropTypes.string.isRequired,
  cb: PropTypes.func.isRequired,
  editSpec: PropTypes.string
};