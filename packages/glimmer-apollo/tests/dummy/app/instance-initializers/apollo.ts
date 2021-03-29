import { registerDestructor } from '@ember/destroyable';
import { setClient, clearClients } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';
import type Application from '@ember/application';

export function initialize(appInstance: Application): void {
  setClient(
    new ApolloClient({
      cache: new InMemoryCache(),
      link: createHttpLink({
        uri: '/graphql'
      })
    })
  );

  registerDestructor(appInstance, () => {
    clearClients();
  });
}

export default {
  initialize
};
