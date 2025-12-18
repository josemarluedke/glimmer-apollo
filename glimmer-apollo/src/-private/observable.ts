import { Resource } from './resource.ts';
import type {
  FetchMoreQueryOptions,
  ObservableQuery,
  OperationVariables,
  SubscribeToMoreOptions,
  Unmasked,
  WatchQueryOptions,
} from '@apollo/client/core';
import type { TemplateArgs } from './types';

export default class ObservableResource<
  TData,
  TVariables extends OperationVariables,
  Args extends TemplateArgs,
> extends Resource<Args> {
  private observable?: ObservableQuery<TData, TVariables>;

  protected _setObservable(observable: ObservableQuery<TData, TVariables>) {
    this.observable = observable;
  }

  refetch = (variables?: Partial<TVariables> | MouseEvent) => {
    if (variables instanceof MouseEvent) {
      return this.observable?.refetch();
    }
    return this.observable?.refetch(variables);
  };

  fetchMore = <
    TFetchData = TData,
    TFetchVars extends OperationVariables = TVariables,
  >(
    fetchMoreOptions: FetchMoreQueryOptions<TFetchVars, TFetchData> & {
      updateQuery?: (
        previousQueryResult: Unmasked<TData>,
        options: {
          fetchMoreResult: Unmasked<TFetchData>;
          variables: TFetchVars;
        },
      ) => Unmasked<TData>;
    },
  ) => this.observable?.fetchMore(fetchMoreOptions);

  updateQuery = (
    mapFn: (
      previousQueryResult: Unmasked<TData>,
      options: Pick<WatchQueryOptions<TVariables, TData>, 'variables'>,
    ) => Unmasked<TData>,
  ) => this.observable?.updateQuery(mapFn);

  startPolling = (pollInterval: number) => {
    this.observable?.startPolling(pollInterval);
  };

  stopPolling = () => {
    this.observable?.stopPolling();
  };

  subscribeToMore = <
    TSubscriptionData = TData,
    TSubscriptionVariables extends OperationVariables = TVariables,
  >(
    options: SubscribeToMoreOptions<
      TData,
      TSubscriptionVariables,
      TSubscriptionData,
      TVariables
    >,
  ) => this.observable?.subscribeToMore(options);
}
