import React from 'react';
import './ImageTools.css';

export default class ImageTools extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        brt: 100,
        sat: 100,
        con: 0
      },
      editSpec: 'brt100-sat100-con0x100',
      id: 'S5V10IJO9MAS1NJ1'
    };
  }

  componentDidUpdate() {
    console.log(this.state.editSpec);
  }

  render() {
    return (
      <div className="image-tools">
        <div className="menu">
          <div className="content-wrap">
            <form onChange={this.updateValues}>
              <label>Brightness</label>
              <input type="range" data-type="brt" value={this.state.values.brt} min="100" max="300"></input>
              <label>Saturation</label>
              <input type="range" data-type="sat" value={this.state.values.sat} min="100" max="300"></input>
              <label>Contrast</label>
              <input type="range" data-type="con" value={this.state.values.con} min="0" max="50"></input>
            </form>
            <button onClick={this.reset}>Reset</button>
          </div>
        </div>
        <div className="crop-container">
          <img className="preview-image" onLoad={this.dimensions} src={`http://proxy.topixcdn.com/ipicimg/${this.state.id}-${this.state.editSpec}`} alt="preview"/>
        </div>
      </div>
    );
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
