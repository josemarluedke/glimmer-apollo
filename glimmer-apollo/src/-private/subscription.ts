import { getClient } from './client.ts';
import {
  isDestroyed,
  isDestroying,
  tracked,
  waitForPromise,
} from '../environment.ts';
import { Resource } from './resource.ts';
import type {
  DocumentNode,
  ErrorLike,
  MaybeMasked,
  OperationVariables,
  SubscriptionOptions as ApolloSubscriptionOptions,
} from '@apollo/client';
import type { Subscription } from 'rxjs';
import { equal } from '@wry/equality';
import { getFastboot, createPromise, settled } from './utils.ts';
import type { TemplateArgs } from './types';

export type SubscriptionOptions<
  TData,
  TVariables extends OperationVariables,
> = Omit<ApolloSubscriptionOptions<TVariables>, 'query'> & {
  ssr?: boolean;
  clientId?: string;
  onData?: (data: MaybeMasked<TData> | undefined) => void;
  onError?: (error: ErrorLike) => void;
  onComplete?: () => void;
};

export type SubscriptionPositionalArgs<
  TData,
  TVariables extends OperationVariables = OperationVariables,
> = [DocumentNode, SubscriptionOptions<TData, TVariables>?];

export class SubscriptionResource<
  TData,
  TVariables extends OperationVariables = OperationVariables,
> extends Resource<
  TemplateArgs<SubscriptionPositionalArgs<TData, TVariables>>
> {
  @tracked loading = true;
  @tracked error?: ErrorLike;
  @tracked data: MaybeMasked<TData> | undefined;
  @tracked promise!: Promise<void>;

  #subscription?: Subscription;
  #previousPositionalArgs: typeof this.args.positional | undefined;

  /** @internal */
  setup(): void {
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
    const observable = client.subscribe<TData, TVariables>({
      query,
      ...options,
    } as ApolloSubscriptionOptions<TVariables, TData>);

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
      error: (error: unknown) => {
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
      },
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

  #onNextResult(result: {
    data?: MaybeMasked<TData>;
    error?: ErrorLike;
  }): void {
    if (result.error) {
      this.#onError(result.error);
      return;
    }

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

  #onError(error: unknown): void {
    this.loading = false;
    this.data = undefined;
    this.error = error instanceof Error ? error : new Error(String(error));

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
