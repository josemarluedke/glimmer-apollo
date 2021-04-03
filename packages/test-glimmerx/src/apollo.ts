import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';
import { setClient } from 'glimmer-apollo';

export default function createClient(): void {
  setClient(
    new ApolloClient({
      cache: new InMemoryCache(),
      link: createHttpLink({
        uri: '/graphql'
      })
    })
  );
}
