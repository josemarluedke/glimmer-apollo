import { getOwner, registerDestructor } from '../environment';
import type { ApolloClient } from '@apollo/client/core';

const CLIENTS: WeakMap<
  object,
  Map<string, ApolloClient<unknown>>
> = new WeakMap();
const DEFAULT_CLIENT_ID = 'default';

export function setClient<TCache = unknown>(
  context: object,
  client: ApolloClient<TCache>,
  clientId: string = DEFAULT_CLIENT_ID
): void {
  const owner = getOwner(context);

  if (!owner) {
    throw new Error(
      'Unable to find owner from the given context in glimmer-apollo setClient'
    );
  }

  if (!CLIENTS.has(owner)) {
    CLIENTS.set(owner, new Map());
  }

  CLIENTS.get(owner)?.set(clientId, client);

  registerDestructor(context, () => {
    clearClient(context, clientId);
  });
}

export function getClient<TCache = unknown>(
  context: object,
  clientId: string = DEFAULT_CLIENT_ID
): ApolloClient<TCache> {
  const owner = getOwner(context);

  if (!owner) {
    throw new Error(
      'Unable to find owner from the given context in glimmer-apollo getClient'
    );
  }

  const client = CLIENTS.get(owner)?.get(clientId);
  if (!client) {
    throw new Error(
      `Apollo client with id ${clientId} has not been set yet, use setClient(new ApolloClient({ ... }, '${clientId}')) to define it`
    );
  }

  return client as ApolloClient<TCache>;
}

export function clearClients(context: object): void {
  const owner = getOwner(context);
  if (!owner) {
    throw new Error(
      'Unable to find owner from the given context in glimmer-apollo clearClients'
    );
  }

  const bucket = CLIENTS.get(owner);
  bucket?.forEach((client) => {
    client.clearStore();
  });

  bucket?.clear();
}

export function clearClient(
  context: object,
  clientId: string = DEFAULT_CLIENT_ID
): void {
  const owner = getOwner(context);
  if (!owner) {
    throw new Error(
      'Unable to find owner from the given context in glimmer-apollo clearClient'
    );
  }

  const bucket = CLIENTS.get(owner);

  const client = bucket?.get(clientId);
  if (client) {
    client.clearStore();
  }
  bucket?.delete(clientId);
}
