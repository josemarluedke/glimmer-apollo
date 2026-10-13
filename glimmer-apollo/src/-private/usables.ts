import { useResource } from './use-resource.ts';
import {
  type MutationOptions,
  type MutationPositionalArgs,
  MutationResource,
} from './mutation.ts';
import {
  type PartialQueryResource,
  type QueryOptions,
  type QueryPositionalArgs,
  QueryResource,
} from './query.ts';
import {
  type SubscriptionPositionalArgs,
  SubscriptionResource,
} from './subscription.ts';
import type {
  DataValue,
  MaybeMasked,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import type { SignatureStyle } from '@apollo/client/utilities/internal';

/**
 * Options that select the partial overload. `returnPartialData: boolean`
 * rather than `true` so a flag variable also lands here, as in Apollo's own
 * `useQuery` overloads.
 */
type PartialQueryOptions<
  TData,
  TVariables extends OperationVariables,
> = QueryOptions<TData, TVariables, DataValue.Partial<MaybeMasked<TData>>> & {
  returnPartialData: boolean;
};

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type --
   Namespaces and the empty-extends interface mirror Apollo Client 4.2's own
   `useQuery.Signatures.{Classic,Modern}` pattern. Declaration merging via
   namespaces is the only way to expose the typed members alongside the
   runtime const. */

export namespace useQuery {
  export namespace Signatures {
    export interface Classic {
      <
        TData = unknown,
        TVariables extends OperationVariables = OperationVariables,
      >(
        parentDestroyable: object,
        args: () => [
          QueryPositionalArgs<TData, TVariables>[0],
          PartialQueryOptions<TData, TVariables>,
        ],
      ): PartialQueryResource<TData, TVariables>;
      <
        TData = unknown,
        TVariables extends OperationVariables = OperationVariables,
      >(
        parentDestroyable: object,
        args: () => QueryPositionalArgs<TData, TVariables>,
      ): QueryResource<TData, TVariables>;
    }
    export interface Modern {
      <
        TData = unknown,
        TVariables extends OperationVariables = OperationVariables,
      >(
        parentDestroyable: object,
        args: () => [
          TypedDocumentNode<TData, TVariables>,
          PartialQueryOptions<TData, NoInfer<TVariables>>,
        ],
      ): PartialQueryResource<TData, TVariables>;
      <
        TData = unknown,
        TVariables extends OperationVariables = OperationVariables,
      >(
        parentDestroyable: object,
        args: () => [
          TypedDocumentNode<TData, TVariables>,
          QueryOptions<TData, NoInfer<TVariables>>?,
        ],
      ): QueryResource<TData, TVariables>;
    }
    export type Evaluated = SignatureStyle extends 'classic' ? Classic : Modern;
  }
  export interface Signature extends Signatures.Evaluated {}
}

function useQueryImpl<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  parentDestroyable: object,
  args: () => QueryPositionalArgs<TData, TVariables>,
): QueryResource<TData, TVariables> {
  return useResource<
    QueryPositionalArgs<TData, TVariables>,
    QueryResource<TData, TVariables>
  >(parentDestroyable, QueryResource, args);
}
export const useQuery: useQuery.Signature = useQueryImpl;

export namespace useMutation {
  export namespace Signatures {
    export interface Classic {
      <
        TData = unknown,
        TVariables extends OperationVariables = OperationVariables,
      >(
        parentDestroyable: object,
        args: () => MutationPositionalArgs<TData, TVariables>,
      ): MutationResource<TData, TVariables>;
    }
    export interface Modern {
      <
        TData = unknown,
        TVariables extends OperationVariables = OperationVariables,
      >(
        parentDestroyable: object,
        args: () => [
          TypedDocumentNode<TData, TVariables>,
          MutationOptions<TData, NoInfer<TVariables>>?,
        ],
      ): MutationResource<TData, TVariables>;
    }
    export type Evaluated = SignatureStyle extends 'classic' ? Classic : Modern;
  }
  export interface Signature extends Signatures.Evaluated {}
}

function useMutationImpl<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  parentDestroyable: object,
  args: () => MutationPositionalArgs<TData, TVariables>,
): MutationResource<TData, TVariables> {
  return useResource<
    MutationPositionalArgs<TData, TVariables>,
    MutationResource<TData, TVariables>
  >(parentDestroyable, MutationResource, args);
}
export const useMutation: useMutation.Signature = useMutationImpl;

/* eslint-enable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */

export function useSubscription<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  parentDestroyable: object,
  args: () => SubscriptionPositionalArgs<TData, TVariables>,
): SubscriptionResource<TData, TVariables> {
  return useResource<
    SubscriptionPositionalArgs<TData, TVariables>,
    SubscriptionResource<TData, TVariables>
  >(parentDestroyable, SubscriptionResource, args);
}

export type UseQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = {
  args: () => QueryPositionalArgs<TData, TVariables>[1];
  return: QueryResource<TData, TVariables>;
  data: TData;
  variables: TVariables;
};

export type UseMutation<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = {
  args: () => MutationPositionalArgs<TData, TVariables>[1];
  return: MutationResource<TData, TVariables>;
  data: TData;
  variables: TVariables;
};

export type UseSubscription<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = {
  args: () => SubscriptionPositionalArgs<TData, TVariables>[1];
  return: SubscriptionResource<TData, TVariables>;
  data: TData;
  variables: TVariables;
};
