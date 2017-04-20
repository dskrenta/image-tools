import React from 'react';
import './ImageEditor.css';
import ReactCrop from 'react-image-crop';
import PropTypes from 'prop-types';

const DEFAULT_CROP = {
  x: 20,
  y: 10,
  width: 30,
  height: 10,
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
      editSpec: this.props.editSpec || DEFAULT_EDIT_SPEC,
      id: this.props.id
    };
    this.previewCrop = DEFAULT_CROP;
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

  /*
  parseEditSpec (editSpec) {
    const specList = editSpec.split('-');
    for (let spec of specList) {
      if (!) {

      }
    }
    console.log(specList.map(item => {
      if(!item.startsWith('cp')) {
        return item;
      }
    }));
    console.log(specList.join('-'));
  }
  */

  onImageLoaded = (crop, image, pixelCrop) => {
    this.setState({pixelCrop: pixelCrop});
  }

  valuesDisplay () {
    if (this.state.pixelCrop) {
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
      cropParam = `cp${this.state.pixelCrop.x}x${this.state.pixelCrop.y}x${this.state.pixelCrop.width}x${this.state.pixelCrop.height}`;
    }
    return `brt${this.state.values.brt}-sat${this.state.values.sat}-con${this.state.values.con}x${100 - this.state.values.con}-${cropParam}`;
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
