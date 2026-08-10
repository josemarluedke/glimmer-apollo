# Modern signatures

Apollo Client 4.2 introduced two parallel hook signature styles, "classic" and "modern", switched globally via a single TypeScript declaration. Glimmer Apollo mirrors Apollo's pattern so you can opt into the same inferred-from-`TypedDocumentNode` ergonomics across `useQuery`, `useMutation`, and `useSubscription`.

Classic is the default, so existing call sites compile unchanged unless you opt into modern signatures; opt-in migrations are covered below.

> See [Apollo's 4.2 release notes](https://github.com/apollographql/apollo-client/blob/main/CHANGELOG.md) for the upstream announcement.

## Opting in

Add a single declaration to a global types file (commonly `types/global.d.ts`):

```ts:types/global.d.ts
import '@apollo/client';

declare module '@apollo/client' {
  export interface TypeOverrides {
    signatureStyle: 'modern';
  }
}
```

That's it. After this augmentation, `useQuery`/`useMutation`/`useSubscription` infer `TData` and `TVariables` from a `TypedDocumentNode` and you can drop the explicit `<TData, TVariables>` generics at call sites.

If you use a GraphQL codegen tool (such as [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)) configured to emit `TypedDocumentNode`, your `.graphql`/`.gql` documents already carry the type information needed for inference.

## Before / after

The runtime is identical — only the declared types change.

### `useQuery`

```ts
// Classic (default) — generics are mandatory, document type is duplicated
notes = useQuery<GetNotesQuery, GetNotesQueryVariables>(this, () => [
  GET_NOTES,
  { variables: { isArchived: this.isArchived } }
]);

// Modern — TData and TVariables inferred from GET_NOTES
notes = useQuery(this, () => [
  GET_NOTES,
  { variables: { isArchived: this.isArchived } }
]);
```

### `useMutation`

```ts
// Classic
createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
  this,
  () => [CREATE_NOTE]
);
await this.createNote.mutate({ title: 'Hi', description: '...' });

// Modern
createNote = useMutation(this, () => [CREATE_NOTE]);
await this.createNote.mutate({ title: 'Hi', description: '...' });
```

### `useSubscription`

`useSubscription` does not have a Classic/Modern split (matching Apollo Client 4.2's own subscription hook), but it does accept a `TypedDocumentNode` and infer types from it without explicit generics.

```ts
// Classic, explicit generics — still works
latestMessage = useSubscription<LatestMessageSubscription, LatestMessageSubscriptionVariables>(
  this,
  () => [LATEST_MESSAGE, { variables: { channel: 'general' } }]
);

// Inferred from the document
latestMessage = useSubscription(this, () => [
  LATEST_MESSAGE,
  { variables: { channel: 'general' } }
]);
```

## What you gain

Apart from less typing, opting in catches a small set of mistakes the classic shape silently accepts when generics are inferred-as-default. The wins are most visible at call sites that already use `TypedDocumentNode`:

- **`variables` at the options site is checked against the document.** A schema rename or wrong-typed value becomes a compile error rather than a silent runtime miss.

  ```ts
  // GetNotes's variables are { isArchived?: boolean | null }
  notes = useQuery(this, () => [
    GET_NOTES,
    // @ts-expect-error — `archive` is not a declared variable
    { variables: { archive: true } }
  ]);
  ```

- **`.mutate(vars)` checks `vars` against the document's `TVariables`.** Under classic this check requires explicit generics; under modern you get it for free at inferred call sites.

  ```ts
  createNote = useMutation(this, () => [CREATE_NOTE]);
  // @ts-expect-error — missing required `description`
  await this.createNote.mutate({ title: 'Hi' });
  ```

## Migration notes

For consumers that opt in **and** use a single-generic call style with narrowly-typed documents, modern is stricter than classic about a few patterns. These are deliberate — the point of opting in is catching them — but listed here as a heads-up:

- **Single-generic `useQuery<MyQuery>` no longer compiles under modern.** Drop the generic and let `TypedDocumentNode` infer instead. Under modern, the unspecified `TVariables` defaults to `OperationVariables`, and a `TypedDocumentNode<MyQuery, MyQueryVariables>` does not satisfy `TypedDocumentNode<MyQuery, OperationVariables>` (`TVariables` is contravariant).

  ```ts
  // Classic — compiles
  notes = useQuery<GetNotesQuery>(this, () => [GET_NOTES]);

  // Modern — does not compile; drop the generic
  notes = useQuery(this, () => [GET_NOTES]);
  ```

- **Plain `DocumentNode` (no `TypedDocumentNode`) still works under modern**, just with `unknown` for `TData`/`TVariables`. No migration needed for documents that aren't typed.

## Notes

- This wrapper's `Signatures.Modern` keeps `<TData = unknown, TVariables = OperationVariables>` defaults, so passing explicit generics at a modern call site is allowed (e.g. for gradual migration). Apollo Client's own modern signatures block explicit generics via a phantom inference-only type parameter ([Apollo 4.2 CHANGELOG](https://github.com/apollographql/apollo-client/blob/main/CHANGELOG.md), under PR #13132). The wrapper deliberately diverges to ease incremental adoption.
- `Signatures.Classic`/`Signatures.Modern` and their `Evaluated` switch use `SignatureStyle` from `@apollo/client/utilities/internal`. That subpath is listed in Apollo's `package.json` exports, though its `internal` naming and lack of documented stability commitments mean it should be treated as advanced surface.
- Requires `@apollo/client@^4.2.0`.
