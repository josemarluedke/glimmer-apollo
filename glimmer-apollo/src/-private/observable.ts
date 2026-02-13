import { Resource } from './resource.ts';
import type {
  ObservableQuery,
  OperationVariables,
  SubscribeToMoreOptions,
  UpdateQueryMapFn,
} from '@apollo/client';
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
    // In Apollo Client 4, refetch() uses a disposable observable that
    // doesn't emit to RxJS subscribers when fetchPolicy is 'standby'.
    // https://github.com/apollographql/apollo-client/pull/12384
    // Use reobserve to permanently switch away from standby so results
    // reach our subscriber. Note: this permanently un-skips the query —
    // after refetch(), the query is no longer in standby and will receive
    // future updates normally.
    if (this.observable?.options.fetchPolicy === 'standby') {
      return this.observable.reobserve({ fetchPolicy: 'network-only' });
    }
    if (variables instanceof MouseEvent) {
      return this.observable?.refetch();
    }
    return this.observable?.refetch(variables);
  };

  fetchMore = <
    TFetchData = TData,
    TFetchVars extends OperationVariables = TVariables,
  >(
    fetchMoreOptions: ObservableQuery.FetchMoreOptions<
      TData,
      TVariables,
      TFetchData,
      TFetchVars
    >,
  ) => this.observable?.fetchMore(fetchMoreOptions);

  updateQuery = (mapFn: UpdateQueryMapFn<TData, TVariables>) =>
    this.observable?.updateQuery(mapFn);

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
