import { NetworkStatus } from '@apollo/client';
import { equal } from '@wry/equality';

import {
  isDestroyed,
  isDestroying,
  tracked,
  waitForPromise,
} from '../environment.ts';
import { getClient } from './client.ts';
import ObservableResource from './observable.ts';
import { createPromise, getFastboot, settled } from './utils.ts';

import type {
  ApolloClient,
  DocumentNode,
  ErrorLike,
  MaybeMasked,
  OperationVariables,
  ObservableQuery,
} from '@apollo/client';
import type { Subscription } from 'rxjs';
import type { TemplateArgs } from './types';

export type QueryOptions<TData, TVariables extends OperationVariables> = Omit<
  ApolloClient.WatchQueryOptions<TData, TVariables>,
  'query'
> & {
  skip?: boolean;
  ssr?: boolean;
  clientId?: string;
  onComplete?: (data: MaybeMasked<TData> | undefined) => void;
  onError?: (error: ErrorLike) => void;
};

export type QueryPositionalArgs<
  TData,
  TVariables extends OperationVariables = OperationVariables,
> = [DocumentNode, QueryOptions<TData, TVariables>?];

export class QueryResource<
  TData,
  TVariables extends OperationVariables = OperationVariables,
> extends ObservableResource<
  TData,
  TVariables,
  TemplateArgs<QueryPositionalArgs<TData, TVariables>>
> {
  @tracked loading = false;
  @tracked error?: ErrorLike;
  @tracked data: MaybeMasked<TData> | undefined;
  @tracked networkStatus: NetworkStatus = NetworkStatus.loading;
  @tracked promise!: Promise<void>;

  #subscription?: Subscription;
  #previousPositionalArgs: typeof this.args.positional | undefined;

  #firstPromiseReject: (() => unknown) | undefined;

  /** @internal */
  setup(): void {
    this.#previousPositionalArgs = this.args.positional;
    const [query, options = {} as QueryOptions<TData, TVariables>] =
      this.args.positional;
    const client = getClient(this, options.clientId);

    const fastboot = getFastboot(this);

    if (
      fastboot &&
      fastboot.isFastBoot &&
      (options.ssr === false || options.skip === true)
    ) {
      return;
    }

    let [promise, firstResolve, firstReject] = createPromise(); // eslint-disable-line prefer-const
    this.#firstPromiseReject = firstReject;
    this.promise = promise;

    const isSkipped = options.skip === true;
    const fetchPolicy = isSkipped ? 'standby' : options.fetchPolicy;

    if (isSkipped || fetchPolicy === 'standby') {
      if (firstResolve) {
        firstResolve();
        firstResolve = undefined;
      }
    } else {
      this.loading = true;
    }

    const observable = client.watchQuery<TData, TVariables>({
      query,
      ...options,
      fetchPolicy,
      // Apollo Client 4 defaults notifyOnNetworkStatusChange to true.
      // We preserve the AC3 default to avoid emitting intermediate loading
      // states during refetch/fetchMore, which would cause consumers relying
      // on synchronous loading checks to see unexpected flickers. Flipping
      // to the default true may be the correct approach, but that will require
      // a breaking change that would require consumers to handle NetworkStatus
      // transitions differently (e.g. refetch, fetchMore, poll).
      notifyOnNetworkStatusChange: options.notifyOnNetworkStatusChange ?? false,
    } as ApolloClient.WatchQueryOptions<TData, TVariables>);

    this._setObservable(observable);

    // Apollo Client 4: errors arrive via result.error, not the error callback.
    // With notifyOnNetworkStatusChange defaulting to true in AC4, the observable
    // emits an initial { loading: true } before data arrives. Gate on
    // !result.loading so the promise resolves only after the first real result,
    // keeping route model hooks and await patterns working correctly.
    this.#subscription = observable.subscribe((result) => {
      this.#onComplete(result);
      if (firstResolve && !result.loading) {
        firstResolve();
        firstResolve = undefined;
      }
    });

    waitForPromise(promise).catch(() => {
      // We catch by default as the promise is only meant to be used
      // as an indicator if the query is being initially fetched.
    });

    if (fastboot && fastboot.isFastBoot && options && options.ssr !== false) {
      fastboot.deferRendering(promise);
    }
  }

  /** @internal */
  update(): void {
    if (!equal(this.#previousPositionalArgs, this.args.positional)) {
      this.teardown();
      this.setup();
    }
  }

  /** @internal */
  teardown(): void {
    if (this.#subscription) {
      this.#subscription.unsubscribe();
    }
    if (typeof this.#firstPromiseReject === 'function') {
      this.#firstPromiseReject();
      this.#firstPromiseReject = undefined;
    }
  }

  settled(): Promise<void> {
    return settled(this.promise);
  }

  #onComplete(result: ObservableQuery.Result<MaybeMasked<TData>>): void {
    const { loading, error, data, networkStatus } = result;

    this.loading = loading;
    // Cast: Apollo Client 4's result type includes DeepPartial<TData> to
    // account for returnPartialData. We expose the stricter TData since
    // consumers who opt into returnPartialData already expect partial shapes.
    // If AC4 tightens this typing in a future version, revisit this cast.
    this.data = data as MaybeMasked<TData> | undefined;
    this.networkStatus = networkStatus;
    this.error = error;

    if (error) {
      if (typeof this.#firstPromiseReject === 'function') {
        this.#firstPromiseReject();
        this.#firstPromiseReject = undefined;
      }
    }

    this.#handleOnCompleteOrOnError();
  }

  #handleOnCompleteOrOnError(): void {
    // We want to avoid calling the callbacks when this is destroyed.
    // If the resource is destroyed, the callback context might not be defined anymore.
    if (isDestroyed(this) || isDestroying(this)) {
      return;
    }

    const [, options] = this.args.positional;
    const { onComplete, onError } = options || {};
    const { data, error } = this;

    if (onComplete && !error) {
      onComplete(data);
    } else if (onError && error) {
      onError(error);
    }
  }
}
