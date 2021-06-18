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
  TODO
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
