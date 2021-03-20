import { Resource } from 'ember-could-get-used-to-this';
import { tracked } from '@glimmer/tracking';
import {
  OperationVariables,
  DocumentNode,
  MutationOptions,
  FetchResult,
  ApolloError
} from '@apollo/client/core';
import { getClient } from './client';

interface MutationFunctionOptions<TData> {
  onComplete?: (data: TData | undefined) => void;
  onError?: (error: ApolloError) => void;
}

interface BaseMutationOptions<TData, TVariables>
  extends Omit<MutationOptions<TData, TVariables>, 'mutation'>,
    MutationFunctionOptions<TData> {}

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
  @tracked error?: ApolloError;
  @tracked data: TData | null | undefined = undefined;

  async mutate(
    variables?: TVariables | undefined,
    overrideOptions: Omit<
      MutationOptions<TData, TVariables>,
      'variables' | 'mutation'
    > = {}
  ): Promise<unknown> {
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
        this.onSuccess(result);
      })
      .catch((error) => {
        this.onError(error);
      });
  }

  private onSuccess(result: FetchResult<TData>): void {
    this.error = undefined;
    this.loading = false;
    this.data = result.data;
  }

  private onError(error: ApolloError): void {
    this.error = error;
    this.loading = false;
    this.data = undefined;
  }
}
