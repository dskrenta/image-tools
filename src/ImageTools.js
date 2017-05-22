import React from 'react';
import PropTypes from 'prop-types';

import {
  convertCropScale,
  convertPercentToPixel,
  convertPixelToPercent
} from './utils';
import './ImageTools.css';

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

  constructor(props) {
    super(props);
    this.imageToolsState = new ImageToolsState();
  }

  render() {
    
  }
}
