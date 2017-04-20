import React from 'react';
import ReactDOM from 'react-dom';
import ImageEditor from './ImageEditor';
import './index.css';

const cb = (result) => {
  console.log(result);
};

ReactDOM.render(
  <ImageEditor id="S5V10IJO9MAS1NJ1" cb={cb}/>,
  document.getElementById('root')
);
