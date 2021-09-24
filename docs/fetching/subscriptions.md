---
order: 3
---

# Subscriptions

In addition to queries and mutations, GraphQL supports a third operation type: `subscriptions`.

Subscriptions enable you to fetch data for long-lasting operations that can change their result over time. They maintain an active connection to your GraphQL server via WebSocket, allowing the server to push updates to the subscription's result.

Subscriptions help notify your client in real-time about changes to back-end data, such as adding new objects, updated fields, and so on.

## Client Setup

As subscriptions usually maintain a persistent connection, they shouldn't use 
the default HTTP transport that Apollo Client uses for queries 
and mutations. Instead, Apollo Client subscriptions most commonly 
communicate over WebSocket, via the community-maintained 
[subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws) library.


```sh
yarn add -D subscriptions-transport-ws
```

```sh
npm install --save-dev subscriptions-transport-ws
```

```ts:app/apollo.ts
import { setClient } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split
} from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';

export default function setupApolloClient(context: object): void {
  // WebSocket connection to the API
  const wsLink = new WebSocketLink({
    uri: 'ws://localhost:3000/subscriptions',
    options: {
      reconnect: true
    }
  });

  // HTTP connection to the API
  const httpLink = createHttpLink({
    uri: 'http://localhost:3000/graphql'
  });

  // Cache implementation
  const cache = new InMemoryCache();

  // Split HTTP link and WebSockete link
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );

  // Create the apollo client
  const apolloClient = new ApolloClient({
    link: splitLink,
    cache
  });

  // Set default apollo client for Glimmer Apollo
  setClient(context, apolloClient);
}
```

## Executing a Subscription

Let's define our GraphQL Subscription document.


```ts:subscriptions.ts
import { gql } from 'glimmer-apollo';

export const ON_MESSAGED_ADDED = gql`
  subscription OnMessageAdded($channel: String!) {
    messageAdded(channel: $channel) {
      id
      message
    }
  }
`;

export type OnMessageAddedSubscriptionVariables = Exact<{
  channel: string;
}>;

export type OnMessageAddedSubscription = {
  __typename?: 'Subscription';

  messageAdded?: {
    __typename?: 'Message';
    id: string;
    message: string;
  } | null;
};
```

## useSubscription

Similar to `useQuery` and `useMutation`, `useSubscription` is a utility function to create a Subscription Resource.

```ts:latest-message.ts
import { useSubscription } from 'glimmer-apollo';
import {
  ON_MESSAGED_ADDED,
  OnMessageAddedSubscription,
  OnMessageAddedSubscriptionVariables
} from './subscriptions';

export default class LatestMessage extends Component {
  latestMessage = useSubscription<
    OnMessageAddedSubscription,
    OnMessageAddedSubscriptionVariables
  >(
    this,
    () => [
      ON_MESSAGED_ADDED,
      {
        /* options */
      }
    ]
  );
}
```

- The `this` is to keep track of destruction. When the context object (`this`) is destroyed, all the subscriptions resources attached to it can be destroyed and the connection closed.
- The second argument to `useSubscription` should always be a function that returns an array.
- The subscription will not be executed until any property of the resource is accessed.

```ts:latest-message.ts
import { useSubscription } from 'glimmer-apollo';
import {
  ON_MESSAGED_ADDED,
  OnMessageAddedSubscription,
  OnMessageAddedSubscriptionVariables
} from './subscriptions';

export default class LatestMessage extends Component {
  latestMessage = useSubscription<
    OnMessageAddedSubscription,
    OnMessageAddedSubscriptionVariables
  >(
    this,
    () => [
      ON_MESSAGED_ADDED,
      {
        variables: {
          channel: 'glimmer-apollo'
        }
      }
    ]
  );

  static template = hbs`
    {{#if this.latestMessage.loading}}
      Connecting..
    {{else if this.latestMessage.error}}
      Error!: {{this.latestMessage.error.message}}
    {{else}}
      <div>
        New Message: {{this.latestMessage.data.messageAdded.message}}
      </div>
    {{/if}}
  `;
}
```

### Variables

You can pass a variables object as part of the options argument for `useSubscription`
args thunk.

```ts
latestMessage = useSubscription(this, () => [
  ON_MESSAGED_ADDED,
  { variables: { channel: this.args.channel } }
]);
```

If your variables are `tracked`, Glimmer Apollo will re-execute your subscription.

## Options

Alongside variables, you can pass additional options to `useSubscription`. These options vary from fetch policies, error policies, and more.

```ts
latestMessage = useSubscription(this, () => [
  ON_MESSAGED_ADDED,
  {
    variables: { channel: this.args.channel },
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    ssr: false
  }
]);
```

### `ssr`

Glimmer Apollo supports SSR with [FastBoot](http://ember-fastboot.com/) by default. Any subscriptions that are triggered while rendering in FastBoot are automatically awaited for the first message to respond.

The `ssr` option allows disabling execution of subscriptions when running in SSR with FastBoot. It will skip the execution entirely in FastBoot but will execute when running in the Browser. This feature is useful if you are fetching secondary data to the page and can wait to be fetched.

### `clientId`

This option specifies which Apollo Client should be used for the given subscription. Glimmer Apollo supports defining multiple Apollo Clients that are distinguished by a custom identifier while setting the client to Glimmer Apollo.

```ts
// ....
setClient(
  this,
  new ApolloClient({
    /* ... */
  }),
  'my-custom-client'
);
// ....
latestMessages = useSubscription(this, () => [ON_MESSAGED_ADDED, { clientId: 'my-custom-client' }]);
```

## Query Status

### `loading`

This is a handy property that allows us to inform our interface that we are loading data.

```ts
import { useSubscription } from 'glimmer-apollo';
import {
  ON_MESSAGED_ADDED,
  OnMessageAddedSubscription,
  OnMessageAddedSubscriptionVariables
} from './subscriptions';

export default class LatestMessage extends Component {
  latestMessage = useSubscription<
    OnMessageAddedSubscription,
    OnMessageAddedSubscriptionVariables
  >(
    this,
    () => [
      ON_MESSAGED_ADDED,
      {
        // ...
      }
    ]
  );

  static template = hbs`
    {{#if this.latestMessage.loading}}
      Loading..
    {{/if}}

    // ...
  `;
}
```

### `error`

This property that can be `undefined` or an `ApolloError` object, holds the information about any errors that occurred while executing your query. The reported errors are directly reflected from the `errorPolicy` option available from Apollo Client.

```ts
import { useSubscription } from 'glimmer-apollo';
import {
  ON_MESSAGED_ADDED,
  OnMessageAddedSubscription,
  OnMessageAddedSubscriptionVariables
} from './subscriptions';

export default class LatestMessage extends Component {
  latestMessage = useSubscription<
    OnMessageAddedSubscription,
    OnMessageAddedSubscriptionVariables
  >(
    this,
    () => [
      ON_MESSAGED_ADDED,
      {
        // ...
        errorPolicy: 'all'
      }
    ]
  );

  static template = hbs`
    {{#if this.latestMessage.loading}}
      Connecting..
    {{else if this.latestMessage.error}}
      Error!: {{this.latestMessage.error.message}}
    {{/if}}

    // ...
  `;
}
```

For most cases, it's usually sufficient to check for the `loading` state, then the `error` state, then finally, assume that the data is available and render it.

### `promise`

This property holds a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves when the subscription receives the first data from the network.
The Promise will only be updated for the first execution of the Resource, meaning that it won't become an unresolved promise when Apollo Cache is updating or when receiving new events.

## Event Callbacks

As part of the options argument to `useSubscription`, you can pass callback functions
allowing you to execute code when a specific event occurs.

### `onData`

This callback gets called when the subscription receives data.

```js
latestMessages = useSubscription(this, () => [
  ON_MESSAGED_ADDED,
  {
    variables: { channel: this.args.channel },
    onData: (data): void => {
      console.log('Received data:', data);
    }
  }
]);
```

### `onError`

This callback gets called when we have an error.

```ts
latestMessages = useSubscription(this, () => [
  ON_MESSAGED_ADDED,
  {
    variables: { channel: this.args.channel },
    onData: (data): void => {
      console.log('Received data:', data);
    },
    onError: (error): void => {
      console.error('Received an error:', error.message);
    }
  }
]);
```

### `onComplete`

This callback gets called when the subscription completes its execution. This 
happens when the server closes the connection for example.

```js
latestMessages = useSubscription(this, () => [
  ON_MESSAGED_ADDED,
  {
    variables: { channel: this.args.channel },
    onData: (data): void => {
      console.log('Received data:', data);
    },
    onError: (error): void => {
      console.error('Received an error:', error.message);
    },
    onComplete: (): void => {
      console.log('Subscription completed');
    }
  }
]);
```

## Authenticate over WebSocket

It is often necessary to authenticate a client before allowing it to receive 
subscription results. To do this, you can provide a `connectionParams` option 
to the `WebSocketLink` constructor in the Apollo Client setup.


```ts
import { WebSocketLink } from '@apollo/client/link/ws';

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
    connectionParams: {
      authorization: 'Bearer My_TOKEN_HERE'
    }
  }
});
```
