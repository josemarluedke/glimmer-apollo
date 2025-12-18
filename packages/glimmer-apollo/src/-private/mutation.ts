import { ApolloError } from '@apollo/client/core';
import { tracked } from '@glimmer/tracking';

import { isDestroyed, isDestroying, waitForPromise } from '../environment';
import { getClient } from './client';
import { Resource } from './resource';
import { settled } from './utils';

import type {
  DocumentNode,
  FetchResult,
  MutationOptions as ApolloMutationOptions,
  OperationVariables
} from '@apollo/client/core';
import type { TemplateArgs } from './types';

type Maybe<T> = T | undefined | null;

export interface MutationOptions<TData, TVariables>
  extends Omit<ApolloMutationOptions<TData, TVariables>, 'mutation'> {
  clientId?: string;
  onComplete?: (data: Maybe<TData>) => void;
  onError?: (error: ApolloError) => void;
}

export type MutationPositionalArgs<
  TData,
  TVariables extends OperationVariables = OperationVariables
> = [DocumentNode, MutationOptions<TData, TVariables>?];

export class MutationResource<
  TData,
  TVariables extends OperationVariables = OperationVariables
> extends Resource<TemplateArgs<MutationPositionalArgs<TData, TVariables>>> {
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
    return settled(this.promise);
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
