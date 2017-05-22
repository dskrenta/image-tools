import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';

import {
  convertCropScale,
  convertPercentToPixel,
  convertPixelToPercent,
  parseEditSpec
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

  static imageHost = 'https://proxy.topixcdn.com/ipicimg/';
  static defaultGravity = {x: 0, y: 0, scale: 1};
  static defaultCrop = {x: 10, y: 10, width: 80, height: 80, aspect: 4/2};

  constructor(props) {
    super(props);
    this.imageToolsState = new ImageToolsState(
      this.props.id,
      parseEditSpec(this.props.editSpec),
      ImageTools.defaultGravity,
      ImageTools.defaultCrop
    );
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}
