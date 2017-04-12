import React from 'react';
import './ImageTools.css';
import ReactCrop from 'react-image-crop';
// import '../node_modules/react-image-crop/dist/ReactCrop.css';
import './ReactCrop.css';

export default class ImageTools extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        brt: 100,
        sat: 100,
        con: 0
      },
      crop: {
        x: 20,
        y: 10,
        width: 30,
        height: 10,
        aspect: 16/9
      },
      editSpec: 'brt100-sat100-con0x100',
      id: 'S5V10IJO9MAS1NJ1'
    };
  }

  componentDidUpdate() {
    console.log(this.state.editSpec);
  }

  render() {
    const defaultCrop = {
      x: 20,
      y: 10,
      width: 30,
      height: 10,
      aspect: 16/9
    }

    return (
      <div className="image-tools">
        <ReactCrop className="preview-image" src={`http://proxy.topixcdn.com/ipicimg/${this.state.id}-${this.state.editSpec}`} crop={this.state.crop} onComplete={this.cropUpdate}/>
        <div className="image-tool-bar">
        <h3>{this.state.crop.width} x {this.state.crop.height}, {this.state.crop.aspect.toFixed(2)}</h3>
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
        </div>
      </div>
    );
  }

  cropUpdate = (crop, pixelCrop) => {
    console.log(crop, pixelCrop);
    this.setState({crop: {
      x: pixelCrop.x,
      y: pixelCrop.y,
      width: pixelCrop.width,
      height: pixelCrop.height,
      aspect: crop.aspect
    }});
  }

  reset = (event) => {
    this.updateEditSpec();
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
