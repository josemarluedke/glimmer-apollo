import { registerDestructor } from '@ember/destroyable';
import { setClient, clearClients } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';

export function initialize(appInstance) {
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
