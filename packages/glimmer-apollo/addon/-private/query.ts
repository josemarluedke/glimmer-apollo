import { Resource } from 'ember-could-get-used-to-this';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import {
  ApolloQueryResult,
  NetworkStatus,
  OperationVariables,
  DocumentNode,
  WatchQueryOptions,
  ObservableQuery,
  ApolloError
} from '@apollo/client/core';
import type Fastboot from 'ember-cli-fastboot/services/fastboot';
import { equal } from '@wry/equality'; // Same as @apollo/client/react
import { getClient } from './client';

interface QueryFunctionOptions<TData> {
  onComplete?: (data: TData | undefined) => void;
  onError?: (error: ApolloError) => void;
}

interface BaseQueryOptions<TData, TVariables>
  extends Omit<WatchQueryOptions<TVariables>, 'query'>,
    QueryFunctionOptions<TData> {
  ssr?: boolean;
}

export type PositionalArgs<TData, TVariables = OperationVariables> = [
  DocumentNode,
  BaseQueryOptions<TData, TVariables>?
];

interface Args<TData, TVariables> {
  positional: PositionalArgs<TData, TVariables>;
}

export class QueryResource<
  TData,
  TVariables = OperationVariables
> extends Resource<Args<TData, TVariables>> {
  @tracked loading = true;
  @tracked error?: ApolloError;
  @tracked data: TData | undefined;
  @tracked networkStatus: NetworkStatus = NetworkStatus.loading;
  @tracked promise!: Promise<void>;

  private observable?: ObservableQuery<TData>;

  get refetch(): ObservableQuery<TData>['refetch'] {
    // TODO ensure this is not undefined
    return this.observable!.refetch.bind(this.observable);
  }

  private subscription?: ZenObservable.Subscription;

  async setup(): Promise<void> {
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

    this.observable = observable;

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

    promise.catch(() => {
      // We catch by default as the promise is only meant to be used
      // as an indicator if the query is being initially fetched.
    });

    if (fastboot && fastboot.isFastBoot && options && options.ssr !== false) {
      fastboot.deferRendering(promise);
    }
  }

  update(): void {
    this.teardown();
    this.setup();
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
    if (!Object.prototype.hasOwnProperty.call(error, 'graphQLErrors'))
      throw error;

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
    return getOwner(this)?.lookup('service:fastboot') as Fastboot;
  }
}
