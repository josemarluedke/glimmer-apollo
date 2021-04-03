import 'glimmer-apollo/environment-glimmer';
import { setClient } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';

export default function createClient(ctx: object): void {
  setClient(
    ctx,
    new ApolloClient({
      cache: new InMemoryCache(),
      link: createHttpLink({
        uri: '/graphql'
      })
    })
  );
}
