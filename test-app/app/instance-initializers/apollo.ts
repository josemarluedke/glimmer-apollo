import { setClient } from 'glimmer-apollo';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import type ApplicationInstance from '@ember/application/instance';

export function initialize(appInstance: ApplicationInstance): void {
  setClient(
    appInstance,
    new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: '/graphql',
      }),
    })
  );
}

export default {
  initialize,
};
