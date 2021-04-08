import { renderComponent } from '@glimmerx/core';
import { startServer } from './mock/server';
import createApollo from './apollo';
import App from './App';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const server = startServer('development');
    server.createList('note', 3);
    createApollo();

    const element = document.getElementById('app');
    renderComponent(App, {
      element: element! // eslint-disable-line
    });
  },
  { once: true }
);
