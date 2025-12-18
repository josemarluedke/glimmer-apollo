import { setClient } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';
import type ApplicationInstance from '@ember/application/instance';

export function initialize(appInstance: ApplicationInstance): void {
  setClient(
    appInstance,
    new ApolloClient({
      cache: new InMemoryCache(),
      link: createHttpLink({
        uri: '/graphql'
      })
    })
  );
}

export default {
  initialize
};
