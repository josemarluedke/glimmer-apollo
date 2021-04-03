import { registerDestructor } from '@ember/destroyable';
import { setClient, clearClients } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';
import { setOwner } from '@ember/application';
import type Application from '@ember/application';

export function initialize(appInstance: Application): void {
  const ctx = {};
  setOwner(ctx, appInstance);

  setClient(
    ctx,
    new ApolloClient({
      cache: new InMemoryCache(),
      link: createHttpLink({
        uri: '/graphql'
      })
    })
  );

  registerDestructor(appInstance, () => {
    clearClients(ctx);
  });
}

export default {
  initialize
};
