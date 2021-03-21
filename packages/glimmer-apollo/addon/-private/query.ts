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
  @tracked private observable?: ObservableQuery<TData>;
  @tracked error?: ApolloError;
  @tracked result: Omit<ApolloQueryResult<TData>, 'errors' | 'data'> & {
    data: TData | undefined;
  } = {
    data: undefined,
    loading: false,
    networkStatus: NetworkStatus.loading
  };

  @tracked promise!: Promise<void>;

  get data(): TData | undefined {
    return this.result.data;
  }

  // get refetch(): ObservableQuery<TData>['refetch'] {
  // // TODO ensure this is not undefined
  // return this.observable!.refetch.bind(this.observable);
  // }

  private subscription?: ZenObservable.Subscription;

  async setup(): Promise<void> {
    const [query, options] = this.args.positional;
    const client = getClient();

    this.loading = true;
    const fastboot = this.getFastboot();

    if (fastboot && fastboot.isFastBoot && options && options.ssr === false) {
      return;
    }

    const [promise, resolve, reject] = this.createPromise();
    this.promise = promise;
    const observable = client.watchQuery({
      query,
      ...(options || {})
    });

    this.observable = observable;

    this.subscription = observable.subscribe({
      next: (result) => {
        this.onComplete(result);
        resolve();
      },
      error: (error) => {
        this.onError(error);
        reject();
      }
    });

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
    const previousResult = this.result;

    const { loading, networkStatus, data, errors } = result;
    let { error } = result;

    // Make sure we're not attempting to re-render similar results
    if (
      previousResult &&
      previousResult.loading === loading &&
      previousResult.networkStatus === networkStatus &&
      equal(previousResult.data, data)
    ) {
      return;
    }

    this.result = result;

    error =
      errors && errors.length > 0
        ? new ApolloError({ graphQLErrors: errors })
        : undefined;

    this.error = error;
    this.handleOnCompleteOrOnError();
  }

  private onError(error: ApolloError): void {
    if (!Object.prototype.hasOwnProperty.call(error, 'graphQLErrors'))
      throw error;

    this.error = error;
    this.handleOnCompleteOrOnError();
  }

  private handleOnCompleteOrOnError(): void {
    this.loading = false;

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
    () => void | undefined,
    () => void | undefined
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
