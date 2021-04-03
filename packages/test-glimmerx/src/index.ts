import { renderComponent } from '@glimmerx/core';
import App from './App';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const element = document.getElementById('app');
    renderComponent(App, {
      element: element! // eslint-disable-line
    });
  },
  { once: true }
);
