# Getting started

Getting up and running with Glimmer Apollo.

## Installation

```sh
yarn add -D glimmer-apollo @apollo/client graphql
```

```sh
npm install --save-dev glimmer-apollo @apollo/client graphql
```

## Compatibility

Here is what Glimmer Apollo is compatible with:

- Apollo Client v3.0 or above
- Ember.js v3.27 or above
- GlimmerX v0.6 or above
- Node.js v12 or above
- FastBoot 1.0+

Glimmer Apollo uses [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), so it does NOT support IE 11 or older browsers.

## Requirements

To use Glimmer Apollo in an Ember app, you must have:

- Embroider or ember-auto-import v2.
- Ember.js v3.27 or above
- Ember CLI v2.13 or above

## Setup the client

The first step to get going is to create and set an `ApolloClient` instance.
For this we will create a file and export a function to set it up. The location
of this file can be something like `app/apollo.js`. It's totally up to you.

```ts:app/apollo.ts
import { setClient } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';

export default function setupApolloClient(context: object): void {
  // HTTP connection to the API
  const httpLink = createHttpLink({
    uri: 'http://localhost:3000/graphql'
  });

  // Cache implementation
  const cache = new InMemoryCache();

  // Create the apollo client
  const apolloClient = new ApolloClient({
    link: httpLink,
    cache
  });

  // Set default apollo client for Glimmer Apollo
  setClient(context, apolloClient);
}
```

The `context` argument for `setClient` can be any object with an Owner. Both
Ember.js apps and Glimmer.js have the concept of Owners, so we should be all set.
For Ember apps specifically, you can also pass an `ApplicationInstance`, which itself
is the Owner. 


> Important: When the context object is torn down, the `ApolloClient` instance
> will be cleared out, removing all its cache, and it will unregister the client
> from Glimmer Apollo.

## Ember Setup

Now that we have defined the Apollo Client let's call the function we created
above in an Instance Initializer.

```ts:app/instance-initializers/apollo.js
import setupApolloClient from '../apollo';

export default {
  initialize: setupApolloClient
};
```

We recommend using an instance initializer as they get executed in component
integration tests, allowing you to run GraphQL queries in your component tests.

### Setup the client for Ember Engines

For Engine we should pass `context.ownerInjection()` instead of `context`
because `EngineInstance` has no `owner` concept and if you try to use `context` it will crash you app. Using `context.ownerInjection()` it will register a new client per engine.

```ts:app/apollo.ts
import { setClient } from 'glimmer-apollo';

export default function setupApolloClient(context: object): void {
  ...

  // Set default apollo client for Glimmer Apollo
  setClient(context.ownerInjection(), apolloClient);
}
```

## Glimmer Setup

For setting up Glimmer Apollo in a Glimmer.js app, we must include a file that
defines the environment. This environment file should be imported very early in
the stack. We recommend importing it in your `src/index.js`.

```js:src/index.js
import 'glimmer-apollo/environment-glimmer'; // <---- Add this import

import { renderComponent } from '@glimmerx/core';
import App from './App';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const element = document.getElementById('app');
    renderComponent(App, {
      element: element! // eslint-disable-line
    });
  },
  { once: true }
);
```

Now that we have imported the environment file and defined the client from the
previous step, we can now call `setupApolloClient` function to set Apollo Client.

The example below uses the App component.

```ts:src/App.js
import Component, { hbs } from '@glimmerx/component';
import setupApolloClient from './apollo';

export class App extends Component {
  constructor(owner: object, args) {
    super(owner, args);
    setupApolloClient(this);
  }

  // ....
}
```

This setup can vary depending on how you have structured your application.
We recommend checking out our [GlimmerX example app](https://github.com/josemarluedke/glimmer-apollo/tree/main/examples/glimmerx)
for a complete reference, including how to get the client set up for tests.
