import React from 'react';
import ReactDOM from 'react-dom';
import ImageTools from './ImageTools';

const cb = (result) => {
  console.log(result);
};

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ImageEditor id="S5V10IJO9MAS1NJ1" cb={cb}/>, div);
});
