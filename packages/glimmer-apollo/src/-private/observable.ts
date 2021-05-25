/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
import { Resource } from './resource';
import type {
  FetchMoreOptions,
  FetchMoreQueryOptions,
  ObservableQuery,
  SubscribeToMoreOptions,
  UpdateQueryOptions
} from '@apollo/client/core';
import type { TemplateArgs } from './types';

export default class ObservableResource<
  TData,
  TVariables,
  Args extends TemplateArgs
> extends Resource<Args> {
  private observable?: ObservableQuery<TData>;

  _setObservable(observable: ObservableQuery<TData>) {
    this.observable = observable;
  }

  refetch = (variables?: Partial<TVariables>) =>
    this.observable?.refetch(variables);

  fetchMore = <K extends keyof TVariables>(
    fetchMoreOptions: FetchMoreQueryOptions<TVariables, K, TData> &
      FetchMoreOptions<TData, TVariables>
  ) => this.observable?.fetchMore(fetchMoreOptions);

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
