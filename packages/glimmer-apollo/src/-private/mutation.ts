import { Resource } from './resource';
import { getClient } from './client';
import {
  isDestroyed,
  isDestroying,
  tracked,
  waitForPromise
} from '../environment';
import { ApolloError } from '@apollo/client/core';
import type {
  DocumentNode,
  FetchResult,
  MutationOptions,
  OperationVariables
} from '@apollo/client/core';

type Maybe<T> = T | undefined | null;

interface MutationFunctionOptions<TData> {
  onComplete?: (data: Maybe<TData>) => void;
  onError?: (error: ApolloError) => void;
}

interface BaseMutationOptions<TData, TVariables>
  extends MutationFunctionOptions<TData>,
    Omit<MutationOptions<TData, TVariables>, 'mutation'> {
  clientId?: string;
}

export type MutationPositionalArgs<TData, TVariables = OperationVariables> = [
  DocumentNode,
  BaseMutationOptions<TData, TVariables>?
];

interface Args<TData, TVariables> {
  positional: MutationPositionalArgs<TData, TVariables>;
  named: Record<string, unknown>;
}

export class MutationResource<
  TData,
  TVariables = OperationVariables
> extends Resource<Args<TData, TVariables>> {
  @tracked loading = false;
  @tracked called = false;
  @tracked error?: ApolloError;
  @tracked data: Maybe<TData>;
  @tracked promise!: Promise<Maybe<TData>>;

  async mutate(
    variables?: TVariables | undefined,
    overrideOptions: Omit<
      MutationOptions<TData, TVariables>,
      'variables' | 'mutation'
    > = {}
  ): Promise<Maybe<TData>> {
    this.loading = true;
    const [mutation, originalOptions] = this.args.positional;
    const options = { ...originalOptions, ...overrideOptions };
    const client = getClient(this, options.clientId);

    if (!variables) {
      variables = originalOptions?.variables;
    } else if (variables && originalOptions?.variables) {
      variables = {
        ...originalOptions.variables,
        ...variables
      };
    }

    this.promise = waitForPromise(
      client.mutate<TData, TVariables>({
        mutation,
        ...options,
        variables
      })
    )
      .then((result) => {
        this.#onComplete(result);
        return this.data;
      })
      .catch((error) => {
        this.#onError(error);
        return error;
      });

    return this.promise;
  }

  settled(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.promise) {
        this.promise.then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    });
  }

  #onComplete(result: FetchResult<TData>): void {
    const { data, errors } = result;
    const error =
      errors && errors.length > 0
        ? new ApolloError({ graphQLErrors: errors })
        : undefined;

    this.data = data;
    this.error = error;

    this.#handleOnCompleteOrOnError();
  }

  #onError(error: ApolloError): void {
    this.error = error;
    this.data = undefined;

    this.#handleOnCompleteOrOnError();
  }

  #handleOnCompleteOrOnError(): void {
    this.loading = false;
    this.called = true;

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
