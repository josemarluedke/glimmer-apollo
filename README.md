<img width="978" alt="github-readme" src="https://user-images.githubusercontent.com/230476/123694510-442eed80-d80e-11eb-8e8b-7ff3d8a0597a.jpg">

<p align="center">
  <a href="https://github.com/josemarluedke/glimmer-apollo/actions?query=workflow%3ACI"><img src="https://github.com/josemarluedke/glimmer-apollo/workflows/CI/badge.svg" alt="Build Status"></a>
  <a href="https://github.com/josemarluedke/glimmer-apollo/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license"></a>
</p>

Glimmer Apollo: Ember integration for Apollo Client.

## Documentation

Visit [glimmer-apollo.com](https://glimmer-apollo.com/) to read the docs.

## Compatibility

- Apollo Client v3.0 or above
- Ember.js v3.27 or above
- Ember CLI v2.13 or above
- Embroider or ember-auto-import v2
- Node.js v12 or above
- FastBoot 1.0+

## API

### useQuery(ctx, args)

```gts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { useQuery, gql } from 'glimmer-apollo';
import Todo from './todo';

export default class Todos extends Component {
  @tracked isDone = false;

  todos = useQuery(this, () => [
    gql`
      query($isDone: Boolean) {
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

  <template>
    <button {{on "click" this.toggleDone}}>Toggle completed todos</button>

    {{#if this.todos.loading}}
      Loading...
    {{/if}}

    {{#each this.todos.data as |todo|}}
      <Todo @todo={{todo}} />
    {{/each}}
  </template>
}
```

### useMutation(ctx, args)

```gts
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { useMutation, gql } from 'glimmer-apollo';

interface Signature {
  Args: {
    todo: {
      id: string;
      description: string;
    };
  };
}

export default class Todo extends Component<Signature> {
  deleteTodo = useMutation(this, () => [
    gql`
      mutation($id: ID!) {
        deleteTodo(id: $id) {
          id
        }
      }
    `,
    { variables: { id: this.args.todo.id } }
  ]);

  <template>
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
  </template>
}
```

### useSubscription(ctx, args)

```gts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { useSubscription, gql } from 'glimmer-apollo';

interface Signature {
  Args: {
    channel: string;
  };
}

interface Message {
  id: string;
  message: string;
}

export default class Messages extends Component<Signature> {
  @tracked receivedMessages: Message[] = [];

  messageAdded = useSubscription(this, () => [
    gql`
      subscription ($channel: String!) {
        messageAdded(channel: $channel) {
          id
          message
        }
      }
    `,
    {
      variables: { channel: this.args.channel },
      onData: (data) => {
        this.receivedMessages = [
          ...this.receivedMessages,
          data.messageAdded
        ]
      }
    }
  ]);

  <template>
    <div>
      {{#if this.messageAdded.loading}}
        Connecting...
      {{/if}}

      {{#each this.receivedMessages as |item|}}
        {{item.message}}
      {{/each}}
    </div>
  </template>
}
```

### setClient(ctx, client[, clientId])

Where `ctx` is an object with owner.

```gts
import Component from '@glimmer/component';
import { setClient } from 'glimmer-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

export default class App extends Component {
  constructor(owner: unknown, args: object) {
    super(owner, args);

    setClient(
      this,
      new ApolloClient({
        uri: 'https://api.example.com/graphql',
        cache: new InMemoryCache()
      })
    );
  }

  <template>
    {{! Your app content }}
  </template>
}
```

### getClient(ctx[,clientId])

Where `ctx` is an object with owner.

```gts
import Component from '@glimmer/component';
import { getClient } from 'glimmer-apollo';
import type { ApolloClient } from '@apollo/client/core';

export default class MyComponent extends Component {
  client: ApolloClient<unknown>;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.client = getClient(this);
  }

  <template>
    {{! Your component content }}
  </template>
}
```

## License

This project is licensed under the MIT License.
