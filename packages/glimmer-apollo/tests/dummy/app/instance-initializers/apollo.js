import { registerDestructor } from '@ember/destroyable';
import { setClient, clearClients } from 'glimmer-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

export function initialize(appInstance) {
  const cache = new InMemoryCache();
  setClient(new ApolloClient({ cache }));

  registerDestructor(appInstance, () => {
    clearClients();
  });
}

export default {
  initialize
};
