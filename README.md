# glimmer-apollo

Ember and Glimmer integration for Apollo Client.

## Installation

```sh
yarn add -D glimmer-apollo @apollo/client graphql
```

```sh
npm install --save-dev glimmer-apollo @apollo/client graphql
```

## Compatibility

- Apollo Client v3.0 or above
- GlimmerX v0.6 or above
- Node.js v12 or above
- FastBoot 1.0+

## Ember Requirements

- Embroider or ember-auto-import v2.
- Ember.js v3.27 or above
- Ember CLI v2.13 or above

## API

### useQuery(ctx, args)

```js
import Component, { hbs, tracked } from '@glimmerx/component';
import { on, action } from '@glimmerx/modifier';
import { useQuery, gql } from 'glimmer-apollo';
import Todo from './todo';

export default class Todos extends Component {
  @tracked isDone = false;

  todos = useQuery(this, () => [
    gql`
      query ($isDone: Boolean) {
        todos(isDone: $isDone) {
          id
          description
        }
      }
    `,
    {
      variables: { isDone: this.isDone }
    }
  ]);

  @action toggleDone() {
    this.isDone = !this.isDone;
  }

  static template = hbs`
    <button {{on "click" this.toggleDone}}>Toggle completed todos</button>

    {{#if this.todos.loading}}
      Loading...
    {{/if}}

    {{#each this.todos.data as |todo|}}
      <Todo @todo={{todo}} />
    {{/each}}
  `;
}
```

### useMutation(ctx, args)

```js
import Component, { hbs } from '@glimmerx/component';
import { on } from '@glimmerx/modifier';
import { useMutation, gql } from 'glimmer-apollo';

export default class Todo extends Component {
  deleteTodo = useMutation(this, () => [
    gql`
      mutation ($id: ID!) {
        deleteTodo(id: $id) {
          id
        }
      }
    `,
    { variables: { id: this.args.todo.id } }
  ]);

  static template = hbs`
    <div>
      {{@todo.description}}
      <button
        {{on "click" this.deleteTodo.mutate}}
        disabled={{this.deleteTodo.loading}}
      >
        {{#if this.deleteTodo.loading}}
          Deleting...
        {{else}}
          Delete
        {{/if}}
      </button>
    </div>
  `;
}
```

### setClient(ctx, client[, clientId])

Where `ctx` is an object with owner.

```js
import { setClient } from 'glimmer-apollo';

class App extends Component {
  constructor() {
    super(...arguments);

    setClient(this, new ApolloClient({ ... });
  }

  // ...
}
```

### getClient(ctx[,clientId])

Where `ctx` is an object with owner.

```js
import { getClient } from 'glimmer-apollo';

class MyComponent extends Component {
  constructor() {
    super(...arguments);

    const client = getClient(this);
  }

  // ...
}
```

## Ember Setup

To correctly setup the Apollo client, you should use an instance initializer.
This will ensure you can access services, for example, to add access tokens to
your requests or something else.

Here is an example:

```js
// app/instance-initializers/apollo.js

import { setClient } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core';

export function initialize(appInstance) {
  setClient(
    appInstance,
    new ApolloClient({
      cache: new InMemoryCache(),
      link: createHttpLink({
        uri: '/graphql'
      })
    })
  );
}

export default {
  initialize
};
```

> Note that when the context (application instance) is torn down, the
> Apollo Client will be cleared and unregistered from Glimmer Apollo.

## License

This project is licensed under the MIT License.
