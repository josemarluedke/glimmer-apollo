import { renderComponent } from '@glimmerx/core';
import { hbs } from '@glimmerx/component';
import 'glimmer-apollo/environment-glimmer';
import { GlimmerApolloProvider } from './apollo';
import { startServer } from './mock/server';
import App from './App';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const server = startServer('development');
    server.createList('note', 10);

    const element = document.getElementById('app');
    renderComponent(
      hbs`
        <GlimmerApolloProvider>
          <App />
        </GlimmerApolloProvider>
      `,
      {
        element: element! // eslint-disable-line
      }
    );
  },
  { once: true }
);
