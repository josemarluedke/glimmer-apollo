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

export type CreateNoteMutation = {
  __typename?: 'Mutation';

  createNote?: {
    __typename?: 'Note';
    id: string;
    title: string;
    description: string;
  } | null;
};

export type CreateNoteMutationVariables = {
  input: {
    title: string;
    description: string;
    isArchived?: boolean | null;
  };
};
```

### useMutation

Similar to `useQuery`, `useMutation` is a utility function to create a Mutation Resource.

```ts:notes.ts
import { useMutation } from 'glimmer-apollo';
import {
  CREATE_NOTE,
  CreateNoteMutation,
  CreateNoteMutationVariables
} from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
    this,
    () => [
      CREATE_NOTE,
      {
        /* options */
      }
    ]
  );
}
```

- The `this` is to keep track of destruction. When the context object (`this`) is destroyed, all the mutations resources attached to it can be destroyed.
- The mutation will not be executed until `mutate` function is called.
- The second argument to `useMutation` should always be a function that returns an array.

```gts:create-note.gts
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { useMutation } from 'glimmer-apollo';
import {
  CREATE_NOTE,
  CreateNoteMutation,
  CreateNoteMutationVariables
} from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
    this,
    () => [
      CREATE_NOTE,
      {
        /* options */
      }
    ]
  );

  @action
  async submit(): Promise<void> {
    await this.createNote.mutate({
      input: {
        title: 'Title',
        description: 'Description',
        isArchived: false
      }
    });
  }

  <template>
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
  </template>
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
import {
  CREATE_NOTE,
  CreateNoteMutation,
  CreateNoteMutationVariables
} from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
    this,
    () => [
      CREATE_NOTE,
      {
        variables: {
          /* default variables here */
        }
      }
    ]
  );

  submit = async (): Promise<void> => {
    await this.createNote.mutate({
      /* overwrite default variables here */
    });
  };
}
```

## Options

Similar to variables, you can pass options to mutations on `useMutation` and `mutate` function call.

```ts:create-note.ts
import { useMutation } from 'glimmer-apollo';
import {
  CREATE_NOTE,
  CreateNoteMutation,
  CreateNoteMutationVariables
} from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
    this,
    () => [
      CREATE_NOTE,
      {
        errorPolicy: 'all'
      }
    ]
  );

  submit = async (): Promise<void> => {
    await this.createNote.mutate(
      {
        /* variables */
      },
      /* additional options */
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
notes = useMutation(this, () => [
  CREATE_NOTE,
  { clientId: 'my-custom-client' }
]);
```

## Mutation Status

### `called`

This boolean property informs if the `mutate` function gets called.

```gts:create-note.gts
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { useMutation } from 'glimmer-apollo';
import {
  CREATE_NOTE,
  CreateNoteMutation,
  CreateNoteMutationVariables
} from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
    this,
    () => [CREATE_NOTE]
  );

  @action
  async submit(): Promise<void> {
    await this.createNote.mutate(/* variables */);
  }

  <template>
    <button {{on "click" this.submit}}>
      Create Note
    </button>

    {{#if this.createNote.called}}
      Mutate function called.
    {{/if}}
  </template>
}
```

### `loading`

This is a handy property that allows us to inform our interface that we are saving data.

```gts:create-note.gts
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { useMutation } from 'glimmer-apollo';
import {
  CREATE_NOTE,
  CreateNoteMutation,
  CreateNoteMutationVariables
} from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
    this,
    () => [CREATE_NOTE]
  );

  @action
  async submit(): Promise<void> {
    await this.createNote.mutate(/* variables */);
  }

  <template>
    <button {{on "click" this.submit}}>
      Create Note
    </button>

    {{#if this.createNote.loading}}
      Creating...
    {{/if}}
  </template>
}
```

### `error`

This property that can be `undefined` or an `ErrorLike` object, holds the information about any errors that occurred while executing your mutation. The reported errors are directly reflected from the `errorPolicy` option available from Apollo Client.

```gts:create-note.gts
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { useMutation } from 'glimmer-apollo';
import {
  CREATE_NOTE,
  CreateNoteMutation,
  CreateNoteMutationVariables
} from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
    this,
    () => [CREATE_NOTE]
  );

  @action
  async submit(): Promise<void> {
    await this.createNote.mutate(/* variables */);
  }

  <template>
    <button {{on "click" this.submit}}>
      Create Note
    </button>

    {{#if this.createNote.error}}
      {{this.createNote.error.message}}
    {{/if}}
  </template>
}
```

## Event Callbacks

As part of the options argument to `useMutation`, you can pass callback functions
allowing you to execute code when a specific event occurs.

### `onComplete`

This callback gets called when the mutation successfully completes execution.

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

## Updating the Cache

When you execute a mutation, you modify backend data. If that data is also present in your [Apollo Client cache](https://www.apollographql.com/docs/react/caching/cache-configuration/), you might need to update your cache to reflect the result of the mutation. It depends on whether the mutation updates a single existing record.

### Updating a single existing record

Apollo will automatically update the record if a mutation updates a single record present in the Apollo Client cache. For this behavior to work, the mutation result must include an `id` field.

### Making all other cache updates

If a mutation modifies multiple entities or creates, deletes records, the Apollo Client cache is **not** automatically updated to reflect the result of the mutation. To manually update the cache, you can pass an `update` function to `useMutation` options.

The purpose of an update function is to modify the cached data to match the modifications that a mutation makes to your backend data without having to refetch the data from your server.

In the example below, we use `GetNotes` query from the previous section to demonstrate how to update the cache when creating a new note.

```gts:create-notes.gts
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { useMutation } from 'glimmer-apollo';
import {
  CREATE_NOTE,
  CreateNoteMutation,
  CreateNoteMutationVariables
} from './mutations';
import { GET_NOTES, GetNotesQuery, GetNotesQueryVariables } from './queries';

export default class CreateNote extends Component {
  createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
    this,
    () => [
      CREATE_NOTE,
      {
        update(cache, result): void {
          const variables = { isArchived: false };

          const data = cache.readQuery<GetNotesQuery, GetNotesQueryVariables>({
            query: GET_NOTES,
            variables
          });

          if (data) {
            const existingNotes = data.notes;
            const newNote = result.data?.createNote;

            if (newNote) {
              cache.writeQuery({
                query: GET_NOTES,
                variables,
                data: { notes: [newNote, ...existingNotes] }
              });
            }
          }
        }
      }
    ]
  );

  @action
  async submit(): Promise<void> {
    await this.createNote.mutate({
      input: {
        title: 'Title',
        description: 'Description',
        isArchived: false
      }
    });
  }

  <template>
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
  </template>
}
```
