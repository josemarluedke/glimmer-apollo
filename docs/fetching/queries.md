---
order: 1
---

# Queries

In this guide, we look into how to fetch GraphQL data using Glimmer Apollo.
It assumes you're familiar with how GraphQL queries work. If aren't,
we recommend this [guide](https://graphql.org/learn/queries/) to learn more
about GraphQL Queries.

For the purpose of this guide, we will be using Glimmer components with
template literals instead of separated template files. This approach can
be used in Ember.js ([with template-imports](https://github.com/ember-template-imports/ember-template-imports))
as well as Glimmer.js. We have omitted its imports because of the different
import paths for `Component` and `hbs`.

## Executing a query

Let's first define our GraphQL Query document.

```ts:title=queries.ts
import { gql } from 'glimmer-apollo';

export const GET_NOTES = gql`
  query GetNotes {
    notes {
      id
      title
      description
    }
  }
`;
```

Next, let's define a component called Notes where we will execute the
query using `useQuery`.

```ts:title=notes.ts
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from './queries';

export default class Notes extends Component {
  notes = useQuery(this, () => [GET_NOTES]);

  static template = hbs`
    {{#if this.notes.loading}}
      Loading...
    {{else if this.notes.error}}
      Error!: {{this.notes.error.message}}
    {{else}}
      {{#each this.notes.data.notes as |note|}}
        <div>
          Title: {{note.title}}
          Description: {{note.description}}
        </div>
      {{/each}}
    {{/if}}
  `;
}
```

The `useQuery` method uses Apollo's [watchQuery](https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.watchQuery)
for fetching from the network and watching the local cache for changes.
A few things to note about `useQuery`, which is a Resource:

- The `this` is to keep track of destruction -- so when `Notes` component is destroyed, all the queries attached to it can be unsubscribed.
- The query will not be executed until it a property is accessed. For example, accessing `loading` or `data` will trigger the query to be executed.
- The second argument to `useQuery` should always be a function that returns an array. This argument can be referred to `Args Thunk.`

### Variables

You can pass a variables object as part of the options argument for `useQuery`
args thunk.

```ts
notes = useQuery(this, () => [
  GET_NOTES,
  { variables: { isArchived: this.isArchived } }
]);
```

If your variables are `tracked`, Glimmer Apollo will re-execute your query.
Let's look at the following example where we modify our original `GetNotes`
query and the `Notes` component to add the ability to filter by `isArchived`.

```ts:title=queries.ts
import { gql } from 'glimmer-apollo';

export const GET_NOTES = gql`
  query GetNotes($isArchived: Boolean) {
    notes(isArchived: $isArchived) {
       id
       title
       description
    }
  }
`;
```

```ts:title=notes.ts
import { tracked } from '@glimmer/tracking';
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from './queries';

export default class Notes extends Component {
  @tracked isArchived = false;

  notes = useQuery(this, () => [
    GET_NOTES,
    { variables: { isArchived: this.isArchived } }
  ]);

  toggleIsArchived = (): void => {
    this.isArchived = !this.isArchived;
  };

  static template = hbs`
    <button {{on "click" this.toggleIsArchived}}>
      {{#if this.isArchived}}
        Show not archived
      {{else}}
        Show archived
      {{/if}}
    </button>

    {{#if this.notes.loading}}
      Loading...
    {{else if this.notes.error}}
      Error!: {{this.notes.error.message}}
    {{else}}
      {{#each this.notes.data.notes as |note|}}
        <div>
          Title: {{note.title}}
          Description: {{note.description}}
        </div>
      {{/each}}
    {{/if}}
  `;
}
```

When the button is clicked, we will re-execute our `GetNotes` query with the
updated `isArchived` value.

## Event Callbacks

As part of the options argument to `useQuery`, you can pass callback functions
allowing you to execute code when a specific event occurs.

### `onComplete`

This callback gets called when the query completes execution and when the
cache associated with this query is updated.

```js
notes = useQuery(this, () => [
  GET_NOTES,
  {
    variables: { isArchived: this.isArchived },
    onComplete: (data): void => {
      console.log('Received data:', data);
    }
  }
]);
```

### `onError`

This callback gets called when we have an error.

```ts
notes = useQuery(this, () => [
  GET_NOTES,
  {
    variables: { isArchived: this.isArchived },
    onComplete: (data): void => {
      console.log('Received data:', data);
    },
    onError: (error): void => {
      console.error('Received an error:', error.message);
    }
  }
]);
```
