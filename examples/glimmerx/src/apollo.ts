import { setClient, clearClients } from 'glimmer-apollo';
import { registerDestructor } from '@glimmer/destroyable';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';
import Component, { hbs } from '@glimmerx/component';

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
  setClient(apolloClient);

  // Clear registered clients on tear down
  if (ctx) {
    registerDestructor(ctx, () => {
      clearClients();
    });
  }
}
