import { tracked } from '@glimmer/tracking';
import { getClient } from './client';
import { isDestroyed, isDestroying, waitForPromise } from '../environment';
import { Resource } from './resource';
import { ApolloError } from '@apollo/client/core';
import type {
  DocumentNode,
  OperationVariables,
  FetchResult,
  SubscriptionOptions as ApolloSubscriptionOptions,
  ObservableSubscription
} from '@apollo/client/core';
import { equal } from '@wry/equality';
import { getFastboot, createPromise, settled } from './utils';
import type { TemplateArgs } from './types';

export interface SubscriptionOptions<TData, TVariables>
  extends Omit<ApolloSubscriptionOptions<TVariables>, 'query'> {
  ssr?: boolean;
  clientId?: string;
  onData?: (data: TData | undefined) => void;
  onError?: (error: ApolloError) => void;
  onComplete?: () => void;
}

export type SubscriptionPositionalArgs<
  TData,
  TVariables = OperationVariables
> = [DocumentNode, SubscriptionOptions<TData, TVariables>?];

export class SubscriptionResource<
  TData,
  TVariables = OperationVariables
> extends Resource<
  TemplateArgs<SubscriptionPositionalArgs<TData, TVariables>>
> {
  @tracked loading = true;
  @tracked error?: ApolloError;
  @tracked data: TData | undefined;
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
    const observable = client.subscribe({
      query,
      ...(options || {})
    });

    this.#subscription = observable.subscribe({
      next: (result) => {
        if (isDestroyed(this) || isDestroying(this)) {
          return;
        }
        this.#onNextResult(result);
        if (firstResolve) {
          firstResolve();
          firstResolve = undefined;
        }
      },
      error: (error) => {
        if (isDestroyed(this) || isDestroying(this)) {
          return;
        }
        this.#onError(error);
        if (firstReject) {
          firstReject();
          firstReject = undefined;
        }
      },
      complete: () => {
        if (isDestroyed(this) || isDestroying(this)) {
          return;
        }
        this.#onComplete();
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
    if (
      !equal(this.#previousPositionalArgs, this.args.positional) ||
      !this.#subscription
    ) {
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

  #onNextResult(result: FetchResult<TData>): void {
    this.loading = false;
    this.error = undefined;

    const { data } = result;
    if (data == null) {
      this.data = undefined;
    } else {
      this.data = data;
    }

    const [, options] = this.args.positional;
    const { onData } = options || {};
    if (onData) {
      onData(this.data);
    }
  }

  #onError(error: ApolloError): void {
    if (!Object.prototype.hasOwnProperty.call(error, 'graphQLErrors')) {
      error = new ApolloError({ networkError: error });
    }

    this.loading = false;
    this.data = undefined;
    this.error = error;

    const [, options] = this.args.positional;
    const { onError } = options || {};
    if (onError) {
      onError(this.error);
    }
  }

  #onComplete(): void {
    this.loading = false;

    const [, options] = this.args.positional;
    const { onComplete } = options || {};
    if (onComplete) {
      onComplete();
    }

    if (this.#subscription) {
      this.#subscription.unsubscribe();
      this.#subscription = undefined;
    }
  }
}
