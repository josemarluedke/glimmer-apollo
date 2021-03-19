import { registerDestructor } from '@ember/destroyable';
import { setClient, clearClients } from 'glimmer-apollo';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

export function initialize(appInstance) {
  setClient(
    new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
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
