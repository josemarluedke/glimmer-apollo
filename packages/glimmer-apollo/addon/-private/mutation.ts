import { Resource } from 'ember-could-get-used-to-this';
import { tracked } from '@glimmer/tracking';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import {
  OperationVariables,
  DocumentNode,
  MutationOptions,
  FetchResult,
  ApolloError
} from '@apollo/client/core';
import { getClient } from './client';

type Maybe<T> = T | undefined | null;

interface MutationFunctionOptions<TData> {
  onComplete?: (data: Maybe<TData>) => void;
  onError?: (error: ApolloError) => void;
}

interface BaseMutationOptions<TData, TVariables>
  extends MutationFunctionOptions<TData>,
    Omit<MutationOptions<TData, TVariables>, 'mutation'> {}

export type PositionalArgs<TData, TVariables = OperationVariables> = [
  DocumentNode,
  BaseMutationOptions<TData, TVariables>?
];

interface Args<TData, TVariables> {
  positional: PositionalArgs<TData, TVariables>;
}

export class MutationResource<
  TData,
  TVariables = OperationVariables
> extends Resource<Args<TData, TVariables>> {
  @tracked loading = false;
  @tracked called = false;
  @tracked error?: ApolloError;
  @tracked data: Maybe<TData>;

  async mutate(
    variables?: TVariables | undefined,
    overrideOptions: Omit<
      MutationOptions<TData, TVariables>,
      'variables' | 'mutation'
    > = {}
  ): Promise<Maybe<TData>> {
    this.loading = true;
    const client = getClient();
    const [mutation, originalOptions] = this.args.positional;

    if (!variables) {
      variables = originalOptions?.variables;
    } else if (variables && originalOptions?.variables) {
      variables = {
        ...originalOptions.variables,
        ...variables
      };
    }

    return client
      .mutate<TData, TVariables>({
        mutation,
        ...originalOptions,
        ...overrideOptions,
        variables
      })
      .then((result) => {
        this.onComplete(result);
        return this.data;
      })
      .catch((error) => {
        this.onError(error);
        return error;
      });
  }

  private onComplete(result: FetchResult<TData>): void {
    const { data, errors } = result;
    const error =
      errors && errors.length > 0
        ? new ApolloError({ graphQLErrors: errors })
        : undefined;

    this.data = data;
    this.error = error;

    this.handleOnCompleteOrOnError();
  }

  private onError(error: ApolloError): void {
    this.error = error;
    this.data = undefined;

    this.handleOnCompleteOrOnError();
  }

  private handleOnCompleteOrOnError(): void {
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
