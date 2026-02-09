# Migrating from 0.7.x (Apollo Client 3) to 0.8.x (Apollo Client 4)

Before upgrading glimmer-apollo, read the [Apollo Client 4 migration guide](https://www.apollographql.com/docs/react/migrating/apollo-client-4-migration). This document only covers changes specific to glimmer-apollo.

## New transitive dependency: RxJS

Apollo Client 4 uses RxJS internally and declares `rxjs@^7.3.0` as a required peer dependency. If you don't already have `rxjs` installed, add it:

```bash
pnpm add rxjs@^7
```

## Import path changes

Apollo Client 4 deprecates the `/core` subpath. Update all imports:

```diff
-import { ApolloClient, InMemoryCache } from '@apollo/client/core';
+import { ApolloClient, InMemoryCache } from '@apollo/client';
```

## `ApolloClient` constructor requires `link`

The `uri` shorthand on the `ApolloClient` constructor has been removed. Use `HttpLink` explicitly:

```diff
-import { ApolloClient, InMemoryCache } from '@apollo/client';
+import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

 new ApolloClient({
   cache: new InMemoryCache(),
-  uri: 'https://api.example.com/graphql',
+  link: new HttpLink({ uri: 'https://api.example.com/graphql' }),
 });
```

## `ApolloError` replaced by specific error classes

Apollo Client 4 removes the `ApolloError` class. Errors are now instances of specific classes (`CombinedGraphQLErrors`, `CombinedProtocolErrors`, `ServerError`, etc.), all of which satisfy the `ErrorLike` interface (`message`, `name`, and optional `stack`). You can use static `.is()` type guards to distinguish them (e.g. `CombinedGraphQLErrors.is(error)`).

Error fields on glimmer-apollo query/mutation/subscription resources are typed as `ErrorLike`. Unlike `ApolloError`, `ErrorLike` does **not** have `graphQLErrors` or `networkError` properties.

If you reference `ApolloError` in your code, replace it:

```diff
-import { ApolloError } from '@apollo/client';
+import type { ErrorLike } from '@apollo/client';

-onError?: (error: ApolloError) => void;
+onError?: (error: ErrorLike) => void;
```

If you access `error.graphQLErrors`, use the type guard instead:

```typescript
import { CombinedGraphQLErrors } from '@apollo/client';

if (CombinedGraphQLErrors.is(error)) {
  error.errors; // GraphQL errors array
}
```

## `ApolloClient` no longer takes a cache type parameter

```diff
-const client: ApolloClient<NormalizedCacheObject> = getClient(this);
+const client: ApolloClient = getClient(this);
```

## Internal: `VariablesOption` type workaround

Apollo Client 4 introduces `VariablesOption<NoInfer<TVariables>>`, a conditional type on all method signatures (`watchQuery`, `mutate`, `subscribe`). This type cannot be satisfied by TypeScript in generic wrapper code — every Apollo Client 4 wrapper library uses `as` casts to work around it:

| Library | Cast Location | Pattern | Source |
|---------|---------------|---------|--------|
| React hooks (Apollo's own) | Input side | `clientOptions as ApolloClient.MutateOptions<TData, OperationVariables>` | [useMutation.ts#L311](https://github.com/apollographql/apollo-client/blob/785e2232b4f7d9e561611cd4f45b8fdd1e44319e/src/react/hooks/useMutation.ts#L311-L314) |
| vue-apollo (v5) | Input side | `as ApolloClient.MutateOptions<TData, TVariables>` | [useMutation.ts#L597](https://github.com/vuejs/apollo/blob/bef7c1c/packages/vue-apollo-composable/src/useMutation.ts#L597) |
| apollo-angular | Input side | `{ ...options, mutation } as Apollo.MutateOptions<TData, TVariables>` | [mutation.ts#L31](https://github.com/the-guild-org/apollo-angular/blob/a15d21147ed37591d055df597ab41163fe569212/packages/apollo-angular/src/mutation.ts#L31) |
| glimmer-apollo | Input side | `{ ...options, mutation } as ApolloMutationOptions<TData, TVariables>` | |

glimmer-apollo follows the apollo-angular pattern: spread options with an input-side cast and explicit type parameters on Apollo method calls. This gives properly typed results without output-side casts.

## Behavioral changes

### `data` is no longer cleared on error

In 0.7.x, glimmer-apollo explicitly cleared `data` when an error occurred:

```typescript
// 0.7.x: on query error
this.loading = false;
this.data = undefined;
this.networkStatus = NetworkStatus.error;
```

In 0.8.x, error state comes directly from Apollo Client 4's result object, which retains previous data alongside errors:

```typescript
// 0.8.x: trusts Apollo Client 4's result
const { loading, error, data, networkStatus } = result;
```

This is the correct behavior — it means `errorPolicy: 'all'` now works as intended, allowing you to render partial data alongside errors. But it has consequences for your templates:

**Always check `error` before rendering `data`.** In 0.7.x, data was cleared on error, so the `{{else}}` branch after `{{#if loading}}` was safe. In 0.8.x, data may persist alongside an error, so skipping the error check means silently rendering stale data.

```hbs
{{! Correct — works in both 0.7.x and 0.8.x }}
{{#if this.notes.loading}}
  Loading...
{{else if this.notes.error}}
  Error: {{this.notes.error.message}}
{{else}}
  {{#each this.notes.data.notes as |note|}}
    ...
  {{/each}}
{{/if}}
```

```hbs
{{! Dangerous — worked by accident in 0.7.x, silently stale in 0.8.x }}
{{#if this.notes.loading}}
  Loading...
{{else}}
  {{#each this.notes.data.notes as |note|}}
    ...
  {{/each}}
{{/if}}
```

Similarly, `{{#if data}}` no longer implies "no error" — both can be truthy at the same time. If you have conditional logic that assumes data is only present when there's no error, review it.

The same applies to mutations: errors are now read from `result.error` (provided by Apollo Client 4's `MutateResult`) instead of being constructed from `result.errors`.

### `errorPolicy: 'all'` now returns data alongside errors

In 0.7.x, `errorPolicy: 'all'` still cleared `data` on error, so partial data was never available alongside GraphQL errors. In 0.8.x, Apollo Client 4 provides both `data` and `error` in the result, enabling the intended use case of rendering partial data and showing errors simultaneously.

### `skip` + `refetch()` permanently un-skips the query

In Apollo Client 4, `refetch()` on a query with `fetchPolicy: 'standby'` (i.e. a skipped query) uses `reobserve({ fetchPolicy: 'network-only' })` internally to switch away from standby. This permanently changes the query's fetch policy — after calling `refetch()`, the query is no longer skipped and will receive future updates normally. This is consistent with how Apollo's own React hooks map `skip` to `fetchPolicy: 'standby'` ([useQuery.ts#L518-L522](https://github.com/apollographql/apollo-client/blob/d25690481b5bf3186d0979569a72c993d3e3684e/src/react/hooks/useQuery.ts#L518-L522)) and how the core `ObservableQuery.refetch()` overrides to `network-only` via `_reobserve` ([ObservableQuery.ts#L770-L814](https://github.com/apollographql/apollo-client/blob/d25690481b5bf3186d0979569a72c993d3e3684e/src/core/ObservableQuery.ts#L770-L814)).

### Subscription error handling

In 0.8.x, `#onNextResult` checks for `result.error` in the subscription's `next` callback and routes it to the error handler if present.

## Breaking changes summary

| Change | Reason |
|--------|--------|
| Requires `@apollo/client` ^4.0.0 | Apollo Client 4 compatibility |
| `rxjs` ^7.3.0 required (transitive via `@apollo/client`) | Apollo Client 4 migrated from zen-observable to RxJS |
| Error types changed from `ApolloError` to `ErrorLike` | Apollo Client 4 removed the `ApolloError` class |
| `data` property typed as `MaybeMasked<TData>` instead of `TData` | Matches Apollo Client 4's data masking support. Resolves to `TData` when data masking is off (default) |
| `setClient`/`getClient` no longer generic over cache type | Apollo Client 4 removed the `TCache` type parameter from `ApolloClient` |
| Query/mutation errors no longer clear `data` | Apollo Client 4 provides error state alongside data; `errorPolicy: 'all'` now works correctly |
| Templates must check `error` before rendering `data` | `data` persists on error; skipping the check renders stale data silently |
| Subscription `#onNextResult` checks `result.error` | Routes errors delivered via the `next` callback to the error handler |
