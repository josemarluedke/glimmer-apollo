---
order: 1
---

# Queries

In this guide, we look into how to fetch GraphQL data using Glimmer Apollo.
It assumes you're familiar with how GraphQL queries work. If you aren't,
we recommend this [guide](https://graphql.org/learn/queries/) to learn more
about GraphQL Queries.

For the purpose of this guide, we will be using Glimmer components with
template literals instead of separated template files. This approach can
be used in Ember.js ([with template-imports](https://github.com/ember-template-imports/ember-template-imports))
as well as Glimmer.js. We have omitted its imports because of the different
import paths for `Component` and `hbs`.

## Executing a query

Let's first define our GraphQL Query document.

```ts:queries.ts
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

### useQuery

This function is the primary way to query GraphQL APIs using Glimmer Apollo. `useQuery` is a utility function that creates a Query Resource instance.

The Query Resource uses Apollo's [watchQuery](https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.watchQuery) for fetching from the network and watching the local cache for changes. It allows the UI to keep up to date with any cache changes and any refetches that might be triggered.

```ts:notes.ts
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from './queries';

export default class Notes extends Component {
  notes = useQuery(this, () => [GET_NOTES, { /* options */ }]);
}
```

- The `this` is to keep track of destruction. When the context object (`this`) is destroyed, all the queries attached to it can be unsubscribed.
- The query will not be executed until a property is accessed. For example, accessing `loading` or `data` will trigger the query to be executed.
- The second argument to `useQuery` should always be a function that returns an array. We can refer to this argument as `Args Thunk.`

```ts:notes.ts
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

```ts:queries.ts
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

```ts:notes.ts
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

## Options

Alongside variables, you can pass additional options to `useQuery`. These options vary from fetch policies, error policies, and more.

```ts
notes = useQuery(this, () => [
  GET_NOTES,
  {
    variables: { isArchived: this.isArchived },
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    ssr: false
  }
]);
```

### `ssr`

Glimmer Apollo supports SSR with [FastBoot](http://ember-fastboot.com/) by default. Any queries that are triggered while rendering in FastBoot are automatically awaited for the server to respond.

The `ssr` option allows disabling fetching of the query when running in SSR with FastBoot. It will skip the execution entirely in FastBoot but will execute when running in the Browser. This feature is useful if you are fetching secondary data to the page and can wait to be fetched.

### `clientId`

This option specifies which Apollo Client should be used for the given query. Glimmer Apollo supports defining multiple Apollo Clients that are distinguished by a custom identifier while setting the client to Glimmer Apollo.

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

## Query Status

### `loading`

This is a handy property that allows us to inform our interface that we are loading data.

```ts
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from './queries';

export default class Notes extends Component {
  notes = useQuery(this, () => [GET_NOTES]);

  static template = hbs`
    {{#if this.notes.loading}}
      Loading...
    {{/if}}

    // ...
  `;
}
```

### `error`

This property that can be `undefined` or an `ApolloError` object, holds the information about any errors that occurred while executing your query. The reported errors are directly reflected from the `errorPolicy` option available from Apollo Client.

```ts
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from './queries';

export default class Notes extends Component {
  notes = useQuery(this, () => [GET_NOTES
    { errorPolicy: 'all' }
  ]);

  static template = hbs`
    {{#if this.notes.error}}
      {{this.notes.error}}
    {{/if}}

    // ...
  `;
}
```

For most cases, it's usually sufficient to check for the `loading` state, then the `error` state, then finally, assume that the data is available and render it.

### `networkStatus`

This property is a number indicating the current network state of the query's associated request.
Similar to the error property, `networkStatus` should be used in conjunction with the `notifyOnNetworkStatusChange` option for detailed info about the network status.

```ts
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from './queries';
import { NetworkStatus } from '@apollo/client/core';

export default class Notes extends Component {
  notes = useQuery(this, () => [
    GET_NOTES,
    { notifyOnNetworkStatusChange: true }
  ]);

  isRefetching(): boolean {
    return this.notes.networkStatus === NetworkStatus.refetch;
  }

  static template = hbs`
    {{#if this.isRefetching}}
      Refetching...
    {{/if}}

    // ...
  `;
}
```

### `promise`

This property holds a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves when the query finishes fetching the data from the network.
The Promise will only be updated for the first execution of the Resource, meaning that it won't become an unresolved promise when Apollo Cache is updating or when refecting.
This property is useful for executing queries in [Ember Routes](#ember-routes).

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

## Derived Data

Deriving data is very simple due to how auto-tracking works. As result, you can just have getters in the component that derive the data you need.

Let's say we want to have a count of notes that are displayed.

```ts:notes.ts
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from './queries';

export default class Notes extends Component {
  notes = useQuery(this, () => [
    GET_NOTES,
  ]);

  get totalNotes(): number {
    return this.notes.data?.notes.length || 0;
  }

  static template = hbs`
    /// ...
    Displaying {{this.totalNotes}} notes

    {{#each this.notes.data.notes as |note|}}
      <div>
        Title: {{note.title}}
        Description: {{note.description}}
      </div>
    {{/each}}
  `;
}
```

## Ember Routes

Fetching data in routes has its use cases.
One aspect of this is that Ember automatically awaits the model hook to be resolved before rendering your template. By design, `useQuery` is built on reactivity in mind, so it might not feel like we could use it in routes, but sure we can.

Below we have an example where we use the property `promise` that holds a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves when the query finishes fetching the data from the network.

```js:app/routes/notes.js
import Route from '@ember/routing/route';
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from '../queries'

export default class NotesRoute extends Route {
  notes = useQuery(this, () => [GET_NOTES]);

  async model() {
    await this.notes.promise;

    return this.notes;
  }
}
```

> Important: You should make sure to return the entire instance of the Resource from the model hook, not partial data. This way, the UI will update when Apollo Client's cache changes.

## Helper functions

Below you can find a few helper functions available from Apollo Client's Query Object.
You can access these directly from the Query Resource as shown below:

```ts:notes.ts
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from './queries';

export default class Notes extends Component {
  notes = useQuery(this, () => [
    GET_NOTES,
  ]);

  static template = hbs`
    <button {{on "click" this.notes.refetch}}>Refech</button>

    {{#each this.notes.data.notes as |note|}}
      <div>
        Title: {{note.title}}
        Description: {{note.description}}
      </div>
    {{/each}}
  `;
}
```

### `refetch`

A function that enables you to re-execute the query, optionally passing in new variables.

### `fetchMore`

A function that helps you fetch the next set of results for a [paginated list field](https://www.apollographql.com/docs/react/pagination/core-api/).

### `updateQuery`

A function that enables you to update the query's cached result without executing a followup GraphQL operation.

### `startPolling`

A function that instructs the query to begin re-executing at a specified interval (in milliseconds).

### `stopPolling`

A function that instructs the query to stop polling after a previous call to `startPolling`.

### `subscribeToMore`

A function that enables you to execute a subscription, usually to subscribe to specific fields that were included in the query.

This function returns another function that you can call to terminate the subscription.
