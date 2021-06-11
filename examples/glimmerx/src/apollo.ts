import Component, { hbs } from '@glimmerx/component';

import { setClient } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';

export class GlimmerApolloProvider extends Component<{}> {
  constructor(owner: object, args: {}) {
    super(owner, args);
    setupApolloClient(this);
  }

  static template = hbs`
    {{#if @Component}}
      <@Component />
    {{/if}}
    {{yield}}
  `;
}

export default function setupApolloClient(ctx: object): void {
  // HTTP connection to the API
  const httpLink = createHttpLink({
    uri: '/graphql'
  });

  // Cache implementation
  const cache = new InMemoryCache();

  // Create the apollo client
  const apolloClient = new ApolloClient({
    link: httpLink,
    cache
  });

  // Set default apollo client for Glimmer Apollo
  setClient(ctx, apolloClient);
}
