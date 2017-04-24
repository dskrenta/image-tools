import React from 'react';
import ReactDOM from 'react-dom';
import ImageTools from './ImageTools';
import './index.css';

const callback = (result) => {
  console.log(result);
};

const crops = [
  {width: 600, height: 300},
  {width: 1200, height: 800},
  {width: 640, height: 480},
  {width: 209, height: 400},
  {width: 1200, height: 627},
  {width: 500, height: 500}
];

ReactDOM.render(
  <ImageTools
    id="S5V10IJO9MAS1NJ1" editSpec="brt100-sat100-con0x100-cp397x45x1376x695"
    aspectLock={false} cb={callback} partnerCrops={crops}
  />,
  document.getElementById('root')
);
