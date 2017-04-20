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

export default class ImageEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: DEFAULT_VALUES,
      crop: DEFAULT_CROP,
      editSpec: this.parseEditSpec(this.props.editSpec) || DEFAULT_EDIT_SPEC,
      id: this.props.id
    };
    this.previewCrop = DEFAULT_CROP;
    this.imageLoadedResolve, this.imageLoadedReject;
    this.imageLoaded = new Promise((resolve, reject) => {
      this.imageLoadedResolve = resolve;
      this.imageLoadedReject = reject;
    });
    this.customEditSpecPattern();
  }

  render() {
    return (
      <div className="image-tools">
        <ReactCrop className="preview-image" onImageLoaded={this.onImageLoaded}
          src={`http://proxy.topixcdn.com/ipicimg/${this.state.id}-${this.state.editSpec}`}
          crop={this.state.crop} onChange={this.cropUpdate} />
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

  async customEditSpecPattern () {
    try {
      let imageDimensions = await this.imageLoaded;
      console.log('imageLoaded', imageDimensions);
    } catch (err) {
      console.error(err);
    }
  }

  parseEditSpec (editSpec) {
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
    this.parseCrop(specs[cpIndex]);
    return returnSpec;
  }

  parseCrop (cropSpec) {
    let values = Array.from(cropSpec).slice(2).join('').split('x');
    this.propCropObj = {
      x: values[0],
      y: values[1],
      width: values[2],
      height: values[3]
    };
  }

  convertCropValues (crop, imageDimensions) {
    const cropObj = {
      x: Math.round((crop.x / imageDimensions.naturalWidth) * imageDimensions.width),
      y: Math.round((crop.y / imageDimensions.naturalHeight) * imageDimensions.height),
      width: Math.round((crop.width / imageDimensions.naturalWidth) * imageDimensions.width),
      height: Math.round((crop.height / imageDimensions.naturalHeight) * imageDimensions.height)
    };
    cropObj.aspect = cropObj.width / cropObj.height;
    return cropObj;
  }

  onImageLoaded = (crop, image, pixelCrop) => {
    // this.imageLoadedResolve();
    this.imageDimensions = {
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      width: image.clientWidth,
      height: image.clientHeight,
      aspect: image.clientWidth / image.clientHeight
    };
    this.imageLoadedResolve(this.imageDimensions);
    if (this.propCropObj) {
      const convertedCrop = this.convertCropValues(this.propCropObj, this.imageDimensions);
      console.log(convertedCrop, this.propCropObj);
      this.setState({crop: convertedCrop});
      this.setState({pixelCrop: this.propCropObj});
    } else {
      this.setState({pixelCrop: pixelCrop});
    }
  }

  valuesDisplay () {
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
    this.previewCrop = crop;
  }

  reset = (event) => {
    this.setState({crop: DEFAULT_CROP});
    this.previewCrop = DEFAULT_CROP;
    this.updateEditSpec();
  }

  done = (event) => {
    this.props.cb(this.createFinalEditSpec());
  }

  createFinalEditSpec () {
    let cropParam = '';
    if (this.state.pixelCrop) {
      cropParam = `-cp${this.state.pixelCrop.x}x${this.state.pixelCrop.y}x${this.state.pixelCrop.width}x${this.state.pixelCrop.height}`;
    }
    return `brt${this.state.values.brt}-sat${this.state.values.sat}-con${this.state.values.con}x${100 - this.state.values.con}${cropParam}`;
  }

  updateEditSpec = (values = {brt: 100, sat: 100, con: 0}) => {
    const editSpec = `brt${values.brt}-sat${values.sat}-con${values.con}x${100 - values.con}`;
    this.setState({values: values, editSpec: editSpec, crop: this.previewCrop});
  }

  updateValues = (event) => {
    const value = event.target.value;
    const type = event.target.dataset.type;
    const values = this.state.values;
    values[type] = value;
    this.updateEditSpec(values);
  }
}

ImageEditor.propTypes = {
  id: PropTypes.string.isRequired,
  cb: PropTypes.func.isRequired,
  editSpec: PropTypes.string
};
