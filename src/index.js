import React from 'react';
import ReactDOM from 'react-dom';
import ImageTools from './ImageTools';
import './index.css';

const cb = (result) => {
  console.log(result);
};

ReactDOM.render(
  <ImageTools cb={cb}/>,
  document.getElementById('root')
);
