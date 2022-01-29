import { getClient } from './client';
import {
  isDestroyed,
  isDestroying,
  tracked,
  waitForPromise
} from '../environment';
import ObservableResource from './observable';
import { NetworkStatus, ApolloError } from '@apollo/client/core';
import { equal } from '@wry/equality';
import { getFastboot, createPromise, settled } from './utils';
import type {
  ApolloQueryResult,
  DocumentNode,
  OperationVariables,
  WatchQueryOptions,
  ObservableSubscription
} from '@apollo/client/core';
import type { TemplateArgs } from './types';

interface QueryOptions<TData, TVariables>
  extends Omit<WatchQueryOptions<TVariables>, 'query'> {
  ssr?: boolean;
  clientId?: string;
  onComplete?: (data: TData | undefined) => void;
  onError?: (error: ApolloError) => void;
}

export type QueryPositionalArgs<TData, TVariables = OperationVariables> = [
  DocumentNode,
  QueryOptions<TData, TVariables>?
];

export class QueryResource<
  TData,
  TVariables = OperationVariables
> extends ObservableResource<
  TData,
  TVariables,
  TemplateArgs<QueryPositionalArgs<TData, TVariables>>
> {
  @tracked loading = true;
  @tracked error?: ApolloError;
  @tracked data: TData | undefined;
  @tracked networkStatus: NetworkStatus = NetworkStatus.loading;
  @tracked promise!: Promise<void>;

  #subscription?: ObservableSubscription;
  #previousPositionalArgs: typeof this.args.positional | undefined;

  /** @internal */
  async setup(): Promise<void> {
    this.#previousPositionalArgs = this.args.positional;
    const [query, options] = this.args.positional;
    const client = getClient(this, options?.clientId);

    this.loading = true;
    const fastboot = getFastboot(this);

    if (fastboot && fastboot.isFastBoot && options && options.ssr === false) {
      return;
    }

    let [promise, firstResolve, firstReject] = createPromise(); // eslint-disable-line prefer-const
    this.promise = promise;
    const observable = client.watchQuery({
      query,
      ...(options || {})
    });

    this._setObservable(observable);

    this.#subscription = observable.subscribe(
      (result) => {
        this.#onComplete(result);
        if (firstResolve) {
          firstResolve();
          firstResolve = undefined;
        }
      },
      (error) => {
        this.#onError(error);
        if (firstReject) {
          firstReject();
          firstReject = undefined;
        }
      }
    );

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
  }

  settled(): Promise<void> {
    return settled(this.promise);
  }

  #onComplete(result: ApolloQueryResult<TData>): void {
    const { loading, errors, data, networkStatus } = result;
    let { error } = result;

    error =
      errors && errors.length > 0
        ? new ApolloError({ graphQLErrors: errors })
        : undefined;

    this.loading = loading;
    this.data = data;
    this.networkStatus = networkStatus;
    this.error = error;
    this.#handleOnCompleteOrOnError();
  }

  #onError(error: ApolloError): void {
    if (!Object.prototype.hasOwnProperty.call(error, 'graphQLErrors')) {
      error = new ApolloError({ networkError: error });
    }

    this.loading = false;
    this.data = undefined;
    this.networkStatus = NetworkStatus.error;
    this.error = error;
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
