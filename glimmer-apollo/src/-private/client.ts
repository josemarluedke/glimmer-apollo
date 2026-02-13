import { getOwner, registerDestructor } from '../environment.ts';
import type { ApolloClient } from '@apollo/client';

type Owner = object;

const CLIENTS: WeakMap<Owner, Map<string, ApolloClient>> = new WeakMap();
const DEFAULT_CLIENT_ID = 'default';

export function setClient(
  context: object,
  client: ApolloClient,
  clientId: string = DEFAULT_CLIENT_ID,
): void {
  const owner = getOwner(context) as Owner | null;

  if (!owner) {
    throw new Error(
      'Unable to find owner from the given context in glimmer-apollo setClient',
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

export function getClient(
  context: object,
  clientId: string = DEFAULT_CLIENT_ID,
): ApolloClient {
  const owner = getOwner(context);

  if (!owner) {
    throw new Error(
      'Unable to find owner from the given context in glimmer-apollo getClient',
    );
  }

  const client = CLIENTS.get(owner)?.get(clientId);
  if (!client) {
    throw new Error(
      `Apollo client with id ${clientId} has not been set yet, use setClient(new ApolloClient({ ... }, '${clientId}')) to define it`,
    );
  }

  return client;
}

export function clearClients(context: object): void {
  const owner = getOwner(context) as Owner | null;
  if (!owner) {
    throw new Error(
      'Unable to find owner from the given context in glimmer-apollo clearClients',
    );
  }

  const bucket = CLIENTS.get(owner);
  bucket?.forEach((client) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    client.clearStore();
  });

  bucket?.clear();
}

export function clearClient(
  context: object,
  clientId: string = DEFAULT_CLIENT_ID,
): void {
  const owner = getOwner(context) as Owner | null;
  if (!owner) {
    throw new Error(
      'Unable to find owner from the given context in glimmer-apollo clearClient',
    );
  }

  const bucket = CLIENTS.get(owner);

  const client = bucket?.get(clientId);
  if (client) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    client.clearStore();
  }
  bucket?.delete(clientId);
}
