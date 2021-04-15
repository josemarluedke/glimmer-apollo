/* global FastBoot */
import { getClient } from './client';
import {
  getOwner,
  isDestroyed,
  isDestroying,
  tracked,
  waitForPromise
} from './environment';
import ObservableResource from './observable';
import { NetworkStatus, ApolloError } from '@apollo/client/core';
import type {
  ApolloQueryResult,
  DocumentNode,
  OperationVariables,
  WatchQueryOptions
} from '@apollo/client/core';
import { equal } from '@wry/equality';
import type { Fastboot } from './types';

interface QueryFunctionOptions<TData> {
  onComplete?: (data: TData | undefined) => void;
  onError?: (error: ApolloError) => void;
}

interface BaseQueryOptions<TData, TVariables>
  extends Omit<WatchQueryOptions<TVariables>, 'query'>,
    QueryFunctionOptions<TData> {
  ssr?: boolean;
}

export type QueryPositionalArgs<TData, TVariables = OperationVariables> = [
  DocumentNode,
  BaseQueryOptions<TData, TVariables>?
];

interface Args<TData, TVariables> {
  positional: QueryPositionalArgs<TData, TVariables>;
  named: Record<string, unknown>;
}

declare global {
  const FastBoot: unknown;
}

export class QueryResource<
  TData,
  TVariables = OperationVariables
> extends ObservableResource<TData, TVariables, Args<TData, TVariables>> {
  @tracked loading = true;
  @tracked error?: ApolloError;
  @tracked data: TData | undefined;
  @tracked networkStatus: NetworkStatus = NetworkStatus.loading;
  @tracked promise!: Promise<void>;

  private subscription?: ZenObservable.Subscription;
  private previousPositionalArgs:
    | Args<TData, TVariables>['positional']
    | undefined;

  async setup(): Promise<void> {
    this.previousPositionalArgs = this.args.positional;
    const [query, options] = this.args.positional;
    const client = getClient();

    this.loading = true;
    const fastboot = this.getFastboot();

    if (fastboot && fastboot.isFastBoot && options && options.ssr === false) {
      return;
    }

    let [promise, firstResolve, firstReject] = this.createPromise(); // eslint-disable-line prefer-const
    this.promise = promise;
    const observable = client.watchQuery({
      query,
      ...(options || {})
    });

    this._setObservable(observable);

    this.subscription = observable.subscribe(
      (result) => {
        this.onComplete(result);
        if (firstResolve) {
          firstResolve();
          firstResolve = undefined;
        }
      },
      (error) => {
        this.onError(error);
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

  settled(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.promise.then(resolve).catch(resolve);
    });
  }

  update(): void {
    if (!equal(this.previousPositionalArgs, this.args.positional)) {
      this.teardown();
      this.setup();
    }
  }

  teardown(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private onComplete(result: ApolloQueryResult<TData>): void {
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
    this.handleOnCompleteOrOnError();
  }

  private onError(error: ApolloError): void {
    if (!Object.prototype.hasOwnProperty.call(error, 'graphQLErrors')) {
      error = new ApolloError({ networkError: error });
    }

    this.loading = false;
    this.data = undefined;
    this.networkStatus = NetworkStatus.error;
    this.error = error;
    this.handleOnCompleteOrOnError();
  }

  private handleOnCompleteOrOnError(): void {
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

  private createPromise(): [
    Promise<void>,
    (() => void) | undefined,
    (() => void) | undefined
  ] {
    let resolvePromise: (val?: unknown) => void | undefined;
    let rejectPromise: (val?: undefined) => void | undefined;
    const promise = new Promise<void>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    return [promise, resolvePromise!, rejectPromise!]; //eslint-disable-line
  }

  private getFastboot(): Fastboot | undefined {
    if (typeof FastBoot === 'undefined') {
      return undefined;
    }
    const owner = getOwner(this);

    if (ownerHasLookup(owner) && typeof owner.lookup === 'function') {
      return owner.lookup('service:fastboot') as Fastboot;
    }

    return undefined;
  }
}

function ownerHasLookup(
  owner: object | undefined
  //eslint-disable-next-line
): owner is { lookup: unknown } {
  return !!(owner && 'lookup' in owner);
}
