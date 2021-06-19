---
order: 2
---

# Mutations

Now that we've learned how to [fetch data](./queries.md), the next step is to learn how to update that data with mutations.

## Executing a Mutation

Let's define our GraphQL Mutation document.

```ts:mutations.ts
import { gql } from 'glimmer-apollo';

export const CREATE_NOTE = gql`
  mutation CreateNote($input: NoteInput!) {
    createNote(input: $input) {
      id
      title
      description
    }
  }
`;
```

### useMutation

Similar to `useQuery`, `useMutation` is a utility function to create a Mutation Resource.

```ts:notes.ts
import { useMutation } from 'glimmer-apollo';
import { CREATE_NOTE } from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation(this, () => [CREATE_NOTE, { /* options */ }]);
}
```

- The `this` is to keep track of destruction. When the context object (`this`) is destroyed, all the mutations resources attached to it can be destroyed.
- The mutation will not be executed until `mutate` function is called.
- The second argument to `useMutation` should always be a function that returns an array.

```ts:create-note.ts
import { useMutation } from 'glimmer-apollo';
import { CREATE_NOTE } from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation(this, () => [
    CREATE_NOTE,
    {
      /* options */
    }
  ]);

  submit = async (): Promise<void> => {
    await this.createNote.mutate(
      input: {
        title: 'Title',
        description: 'Description',
        isArchived: false
      }
    });
  };

  static template = hbs`
    <button {{on "click" this.submit}}>
      Create Note
    </button>

    {{#if this.createNote.loading}}
      Creating...
    {{else if this.createNote.error}}
      Error!: {{this.createNote.error.message}}
    {{else if this.createNote.called}}
      <div>
        id: {{this.createNote.data.createNote.id}}
        Title: {{this.createNote.data.createNote.title}}
        Description: {{this.createNote.data.createNote.description}}
      </div>
    {{/if}}
  `;
}
```

In the example above, we call the `mutate` function to execute the GraphQL mutation in the backend API.

The `mutate` function returns a Promise that resolves with the received data. It's important to note that it will not throw if an error occurs, making the use of `try catch` not possible with the `mutate` function.

### Variables

There are two ways you can pass variables to mutations.

1. Pass alongside the options in `useMutation`.
2. Pass when calling `mutate`.

Which one should you use? It depends on how you are getting the data for your mutation.
It probably makes sense to pass in the `mutate` call if it comes from a form.
However, some data might be present early on, so you might also want to pass these variables in the `useMutation`. Glimmer Apollo does a shallow merge on variables provided earlier, with these provided at `mutate` time.

```ts:create-note.ts
import { useMutation } from 'glimmer-apollo';
import { CREATE_NOTE } from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation(this, () => [
    CREATE_NOTE,
    {
      variables: {
        // default variables here
      }
    }
  ]);

  submit = async (): Promise<void> => {
    await this.createNote.mutate(
      // overwrite default variables here
    });
  };
}
```

## Options

Similar to variables, you can pass options to mutations on `useMutation` and `mutate` function call.

```ts:create-note.ts
import { useMutation } from 'glimmer-apollo';
import { CREATE_NOTE } from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation(this, () => [
    CREATE_NOTE,
    {
      errorPolicy: 'all'
    }
  ]);

  submit = async (): Promise<void> => {
    await this.createNote.mutate(
      {
        // variables
      },
      // additional options
      { refetchQueries: ['GetNotes'] }
    );
  };
}
```

### `clientId`

This option specifies which Apollo Client should be used for the given mutation. Glimmer Apollo supports defining multiple Apollo Clients that are distinguished by a custom identifier while setting the client to Glimmer Apollo.

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
notes = useQuery(this, () => [GET_NOTES, { clientId: 'my-custom-client' }]);
```

## Mutation Status

### `called`

This boolean property informs if the `mutate` function gets called.

```ts:create-note.ts
import { useMutation } from 'glimmer-apollo';
import { CREATE_NOTE } from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation(this, () => [CREATE_NOTE]);

  submit = async (): Promise<void> => {
    await this.createNote.mutate(/* variables */);
  };

  static template = hbs`
    <button {{on "click" this.submit}}>
      Create Note
    </button>

    {{#if this.createNote.called}}
      Mutate function called.
    {{/if}}
  `;
}
```

### `loading`

This is a handy property that allows us to inform our interface that we are saving data.

```ts:create-note.ts
import { useMutation } from 'glimmer-apollo';
import { CREATE_NOTE } from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation(this, () => [CREATE_NOTE]);

  submit = async (): Promise<void> => {
    await this.createNote.mutate(/* variables */);
  };

  static template = hbs`
    <button {{on "click" this.submit}}>
      Create Note
    </button>

    {{#if this.createNote.loading}}
      Creating...
    {{/if}}
  `;
}
```

### `error`

This property that can be `undefined` or an `ApolloError` object, holds the information about any errors that occurred while executing your mutation. The reported errors are directly reflected from the `errorPolicy` option available from Apollo Client.

```ts:create-note.ts
import { useMutation } from 'glimmer-apollo';
import { CREATE_NOTE } from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation(this, () => [CREATE_NOTE]);

  submit = async (): Promise<void> => {
    await this.createNote.mutate(/* variables */);
  };

  static template = hbs`
    <button {{on "click" this.submit}}>
      Create Note
    </button>

    {{#if this.createNote.error}}
      {{this.createNote.error.message}}
    {{/if}}
  `;
}
```

## Event Callbacks

As part of the options argument to `useMutation`, you can pass callback functions
allowing you to execute code when a specific event occurs.

### `onComplete`

This callback gets called when the mutation completes execution.

```ts
createNote = useMutation(this, () => [
  CREATE_NOTE,
    onComplete: (data): void => {
      console.log('Received data:', data);
    }
  }
]);
```

### `onError`

This callback gets called when we have an error.

```ts
createNote = useMutation(this, () => [
  CREATE_NOTE,
  {
    onComplete: (data): void => {
      console.log('Received data:', data);
    },
    onError: (error): void => {
      console.error('Received an error:', error.message);
    }
  }
]);
```
