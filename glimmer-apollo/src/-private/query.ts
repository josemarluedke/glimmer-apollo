import { NetworkStatus } from '@apollo/client';
import { equal } from '@wry/equality';

import {
  isDestroyed,
  isDestroying,
  next,
  tracked,
  waitForPromise,
} from '../environment.ts';
import { getClient } from './client.ts';
import ObservableResource from './observable.ts';
import { createPromise, getFastboot, settled } from './utils.ts';

import type {
  ApolloClient,
  DataValue,
  DocumentNode,
  ErrorLike,
  MaybeMasked,
  OperationVariables,
  ObservableQuery,
  TypedDocumentNode,
} from '@apollo/client';
import type { Subscription } from 'rxjs';
import type { TemplateArgs } from './types';

/**
 * `TResultData` is the shape `data` (and `onComplete`'s argument) is typed
 * as: complete by default, `DataValue.Partial` when `returnPartialData` is set.
 */
export type QueryOptions<
  TData,
  TVariables extends OperationVariables,
  TResultData = MaybeMasked<TData>,
> = Omit<
  ApolloClient.WatchQueryOptions<TData, TVariables>,
  'query' | 'variables'
> & {
  variables?: TVariables;
  skip?: boolean;
  ssr?: boolean;
  clientId?: string;
  onComplete?: (data: TResultData | undefined) => void;
  onError?: (error: ErrorLike) => void;
};

export type QueryPositionalArgs<
  TData,
  TVariables extends OperationVariables = OperationVariables,
  TResultData = MaybeMasked<TData>,
> = [
  DocumentNode | TypedDocumentNode<TData, TVariables>,
  QueryOptions<TData, TVariables, TResultData>?,
];

/**
 * A query read with `returnPartialData`: `data` can miss fields, whether it is
 * a cache read before the network answers, a result with `errorPolicy: 'all'`
 * where a field errored, or a cache read after an eviction.
 */
export type PartialQueryResource<
  TData,
  TVariables extends OperationVariables = OperationVariables,
> = QueryResource<TData, TVariables, DataValue.Partial<MaybeMasked<TData>>>;

/**
 * The state of one observable. `start` is what it began with: setup() runs
 * inside the resource's own computation, where a tracked write would change
 * state the running render may already have used. Every reader goes through
 * that computation, so a plain field that only changes there is always
 * current. `latest` is the last result that arrived afterwards.
 */
class ObservedResult<TResult> {
  @tracked latest?: TResult;
  start: TResult;

  constructor(start: TResult) {
    this.start = start;
  }

  get current(): TResult {
    return this.latest ?? this.start;
  }
}

export class QueryResource<
  TData,
  TVariables extends OperationVariables = OperationVariables,
  TResultData = MaybeMasked<TData>,
> extends ObservableResource<
  TData,
  TVariables,
  TemplateArgs<QueryPositionalArgs<TData, TVariables>>
> {
  #result = new ObservedResult<ObservableQuery.Result<MaybeMasked<TData>>>({
    data: undefined,
    dataState: 'empty',
    loading: false,
    networkStatus: NetworkStatus.loading,
    partial: true,
  });

  /** The result of Apollo Client. Its `dataState` narrows its `data`. */
  get result(): ObservableQuery.Result<MaybeMasked<TData>> {
    return this.#result.current;
  }

  get loading(): boolean {
    return this.#result.current.loading;
  }

  get error(): ErrorLike | undefined {
    return this.#result.current.error;
  }

  get data(): TResultData | undefined {
    // Apollo types every result's data as complete | partial; the overload
    // that built this resource decided which of the two TResultData is.
    return this.#result.current.data as TResultData | undefined;
  }

  get networkStatus(): NetworkStatus {
    return this.#result.current.networkStatus;
  }

  promise!: Promise<void>;

  #subscription?: Subscription;
  #previousPositionalArgs: typeof this.args.positional | undefined;

  #firstPromiseReject: (() => unknown) | undefined;

  /**
   * True only while subscribe() is replaying a cached result synchronously
   * from inside setup(), i.e. while we are still in the resource's tracking
   * computation.
   */
  #inSetup = false;

  /**
   * Callbacks for setup replays, waiting for the runloop. A later emission
   * flushes them first so callbacks always run in emission order.
   */
  #deferredCallbacks: (() => void)[] = [];

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

    // The previous result stays readable until the new observable answers.
    const previous = this.#result.current;
    const observed = new ObservedResult(
      isSkipped || fetchPolicy === 'standby'
        ? previous
        : { ...previous, loading: true },
    );
    this.#result = observed;

    if (isSkipped || fetchPolicy === 'standby') {
      if (firstResolve) {
        firstResolve();
        firstResolve = undefined;
      }
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
    this.#inSetup = true;
    this.#subscription = observable.subscribe((result) => {
      this.#onComplete(result, observed);
      if (firstResolve && !result.loading) {
        firstResolve();
        firstResolve = undefined;
      }
    });
    this.#inSetup = false;

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

  #onComplete(
    result: ObservableQuery.Result<MaybeMasked<TData>>,
    observed: ObservedResult<ObservableQuery.Result<MaybeMasked<TData>>>,
  ): void {
    // Apollo Client 4 replays the current cache result synchronously from
    // subscribe(), inside the resource's computation: that result is where
    // this observable starts. Later results arrive outside it.
    if (this.#inSetup) {
      observed.start = result;
    } else {
      observed.latest = result;
    }

    if (result.error) {
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
    const invoke = (): void => {
      if (onComplete && !error) {
        // args keep the default options type so a complete resource stays
        // assignable to a partial one; the overload matched onComplete's
        // parameter to TResultData already.
        onComplete(data as MaybeMasked<TData> | undefined);
      } else if (onError && error) {
        onError(error);
      }
    };

    if (!this.#inSetup) {
      // The network can answer before the runloop tick a setup replay was
      // handed to; run that replay first so callbacks keep emission order.
      this.#flushDeferredCallbacks();
      invoke();
      return;
    }

    // Apollo Client 4 replays the current cache result synchronously from
    // subscribe(), so this call arrives inside the resource's tracking
    // computation. Consumers commonly read tracked state in the options thunk
    // and write to it here -- clearing a poll interval once the data arrives --
    // which would trip Ember's backtracking assertion. Hand just that replay to
    // the runloop; settled() still waits for it. Callbacks for later, async
    // emissions keep running synchronously, as they always have.
    this.#deferredCallbacks.push(invoke);
    next(() => this.#flushDeferredCallbacks());
  }

  #flushDeferredCallbacks(): void {
    const callbacks = this.#deferredCallbacks;
    this.#deferredCallbacks = [];

    if (isDestroyed(this) || isDestroying(this)) {
      return;
    }

    callbacks.forEach((invoke) => invoke());
  }
}
