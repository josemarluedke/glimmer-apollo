import { Resource } from 'ember-could-get-used-to-this';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
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
import { getClient } from '../client';

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

  @tracked promise!: Promise<TData>;

  get data(): TData | undefined {
    return this.result.data;
  }

  // get refetch(): ObservableQuery<TData>['refetch'] {
  // // TODO ensure this is not undefined
  // return this.observable!.refetch.bind(this.observable);
  // }

  private subscription?: ZenObservable.Subscription;

  // get value(): Omit<ApolloQueryResult<TData>, 'errors' | 'data'> & {
  // data: TData | undefined;
  // promise: Promise<TData>;
  // } {
  // return {
  // data: undefined,
  // ...this.result,
  // error: this.result.error || this.error,
  // loading: this.loading ? this.loading : this.result.loading,
  // promise: this.promise
  // };
  // }

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
        const { loading, networkStatus, data } = result;
        const previousResult = this.result;

        // Make sure we're not attempting to re-render similar results
        if (
          previousResult &&
          previousResult.loading === loading &&
          previousResult.networkStatus === networkStatus &&
          equal(previousResult.data, data)
        ) {
          return;
        }

        this.updateResult(result);
        this.onCompleteOrError(options);

        if (typeof resolve === 'function') {
          resolve(this.data!); //eslint-disable-line
        }
      },
      error: (error) => {
        this.loading = false;
        if (!Object.prototype.hasOwnProperty.call(error, 'graphQLErrors'))
          throw error;

        const previousResult = this.result;
        if (
          (previousResult && previousResult.loading) ||
          !equal(error, previousResult.error)
        ) {
          this.error = error;
        }
        this.onCompleteOrError(options);
        reject(error);
      }
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

  private updateResult(result: ApolloQueryResult<TData>): void {
    this.loading = false;
    const { error, ...rest } = result;
    this.error = error;
    this.result = rest;
  }

  private onCompleteOrError(options: QueryFunctionOptions<TData> = {}): void {
    const { onComplete, onError } = options;
    const { data, error } = this;

    if (onComplete && !error) {
      onComplete(data);
    } else if (onError && error) {
      onError(error);
    }
  }

  private createPromise(): [
    Promise<TData>,
    (data: TData) => void | undefined,
    (error?: unknown) => void | undefined
  ] {
    let resolvePromise: (val?: unknown) => void | undefined;
    let rejectPromise: (val?: undefined) => void | undefined;
    const promise = new Promise<TData>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    return [promise, resolvePromise!, rejectPromise!]; //eslint-disable-line
  }

  private getFastboot(): Fastboot | undefined {
    return getOwner(this)?.lookup('service:fastboot') as Fastboot;
  }
}
