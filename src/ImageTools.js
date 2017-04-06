import React from 'react';
import './ImageTools.css';

class ImageTools extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        brt: 100,
        sat: 100,
        con: 0
      }
    };
  }

  render() {
    return (
      <div className="image-tools">
        <div className="menu">
          <div className="content-wrap">
            <button onClick={this.done}>Done</button>
            <form onChange={this.updateFilters}>
              <label>Brightness</label>
              <input type="range" data-type="brt" value={this.state.filters.brt} min="100" max="300"></input>
              <label>Saturation</label>
              <input type="range" data-type="sat" value={this.state.filters.sat} min="100" max="300"></input>
              <label>Contrast</label>
              <input type="range" data-type="con" value={this.state.filters.con} min="0" max="50"></input>
            </form>
          </div>
        </div>
      </div>
    );
  }

  updateFilters = (event) => {
    const value = event.target.value;
    const type = event.target.dataset.type;
    const filters = this.state.filters;
    filters[type] = value;
    this.setState({filters});
  }
}

export default ImageTools;
