import React from 'react';
import ReactDOM from 'react-dom';
// import ImageEditor from './ImageEditor';
import ImageTools from './ImageTools';
import './index.css';

const cb = (result) => {
  console.log(result);
};

ReactDOM.render(
  <ImageTools id="S5V10IJO9MAS1NJ1" editSpec="brt100-sat100-con0x100-cp397x45x1376x695" aspectLock={false} cb={cb}/>,
  document.getElementById('root')
);
