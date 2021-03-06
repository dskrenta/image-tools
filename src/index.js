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
    id="S5V10IJO9MAS1NJ1" editSpec="brt187-sat215-con0x100-cp243x45x1465x856"
    aspectLock={true} cb={callback} partnerCrops={crops}
  />,
  document.getElementById('root')
);
