# glimmer-apollo

Ember and Glimmer integration for Apollo Client.

> **WIP: This project is currently in development.**
>
> Glimmer standalone integration is in a very early stage and not yet proven. This should be possible to achieve though. See tracking issue [#1](https://github.com/josemarluedke/glimmer-apollo/issues/1).

## API

### useQuery(ctx, args)

```js
import Component, { hbs, tracked } from '@glimmerx/component';
import { on, action } from '@glimmerx/modifier';
import { useQuery } from 'glimmer-apollo';
import gql from 'graphql-tag';
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
  };

  static template = hbs`
    <button {{on "click" this.toggleDone}}>Toggle completed todos</button>

    {{#if this.todos.loading}}
      Loading...
    {{/if}}

    {{#ach this.todos.data as |todo|}}
      <Todo @todo={{todo}} />
    {{/each}}
  `;
}
```

### useMutation(ctx, args)

```js
import Component, { hbs } from '@glimmerx/component';
import { on } from '@glimmerx/modifier';
import { useMutation } from 'glimmer-apollo';
import gql from 'graphql-tag';

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

### setClient(client[, clientId])

```js
import { setClient } from 'glimmer-apollo';

setClient(new ApolloClient({ ... });
```

### getClient()

```js
import { getClient } from 'glimmer-apollo';

const client = getClient([clientId]);
```

## License

This project is licensed under the [MIT License](LICENSE.md).
