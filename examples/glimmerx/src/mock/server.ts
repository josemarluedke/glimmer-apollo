/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */

import { createServer } from 'miragejs';
import { createGraphQLHandler } from '@miragejs/graphql';
import graphQLSchema from './schema.graphql';
import factories from './factories';
// import models from './models';
import defaultResolvers from './resolvers';

export function startServer(environment = 'test') {
  return createServer({
    environment,
    // models,
    seeds() {
      // Factories doesn't work if `seeds` is not defined.
    },
    factories,
    routes() {
      this.post('/graphql', (mirageSchema, request) => {
        return createGraphQLHandler(graphQLSchema, this.schema, {
          context: { mirageServer: this },
          root: undefined,
          resolvers: defaultResolvers
        })(mirageSchema, request);
      });
    }
  });
}
