/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
import { Resource } from './resource.ts';
import type {
  FetchMoreOptions,
  FetchMoreQueryOptions,
  ObservableQuery,
  OperationVariables,
  SubscribeToMoreOptions,
  UpdateQueryOptions
} from '@apollo/client/core';
import type { TemplateArgs } from './types';

export default class ObservableResource<
  TData,
  TVariables extends OperationVariables,
  Args extends TemplateArgs
> extends Resource<Args> {
  private observable?: ObservableQuery<TData>;

  protected _setObservable(observable: ObservableQuery<TData>) {
    this.observable = observable;
  }

  refetch = (variables?: Partial<TVariables>) =>
    this.observable?.refetch(variables);

  fetchMore = (
    fetchMoreOptions: FetchMoreQueryOptions<TVariables, TData> &
      FetchMoreOptions<TData, TVariables>
  ) =>
    this.observable?.fetchMore(
      fetchMoreOptions as FetchMoreQueryOptions<OperationVariables, TData> &
        FetchMoreOptions<TData, OperationVariables>
    );

  updateQuery = <TVars = TVariables>(
    mapFn: (
      previousQueryResult: TData,
      options: UpdateQueryOptions<TVars>
    ) => TData
  ) => this.observable?.updateQuery(mapFn);

  startPolling = (pollInterval: number) => {
    this.observable?.startPolling(pollInterval);
  };

  stopPolling = () => {
    this.observable?.stopPolling();
  };

  subscribeToMore = <
    TSubscriptionData = TData,
    TSubscriptionVariables = TVariables
  >(
    options: SubscribeToMoreOptions<
      TData,
      TSubscriptionVariables,
      TSubscriptionData
    >
  ) => this.observable?.subscribeToMore(options);
}
