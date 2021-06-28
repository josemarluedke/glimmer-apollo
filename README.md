<img width="978" alt="github-readme" src="https://user-images.githubusercontent.com/230476/123680246-548a9c80-d7fd-11eb-9d38-d1f838619b98.jpg">
<p align="center">
  <a href="https://github.com/josemarluedke/glimmer-apollo/actions?query=workflow%3ACI"><img src="https://github.com/josemarluedke/glimmer-apollo/workflows/CI/badge.svg" alt="Build Status"></a>
  <a href="https://github.com/josemarluedke/glimmer-apollo/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license"></a>
</p>


Glimmer Apollo: Ember and Glimmer integration for Apollo Client.

## Documentation

Visit [glimmer-apollo.com](https://glimmer-apollo.com/) to read the docs.


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
      mutation($id: ID!) {
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

## License

This project is licensed under the MIT License.
