import type { ApolloClient } from '@apollo/client/core';

const CLIENTS: Map<string, ApolloClient<unknown>> = new Map();
const DEFAULT_CLIENT_ID = 'default';

export function setClient<TCache = unknown>(
  client: ApolloClient<TCache>,
  clientId: string = DEFAULT_CLIENT_ID
): void {
  CLIENTS.set(clientId, client);
}

export function getClient<TCache = unknown>(
  clientId: string = DEFAULT_CLIENT_ID
): ApolloClient<TCache> {
  const client = CLIENTS.get(clientId);

  if (!client) {
    throw new Error(
      `Apollo client with id ${clientId} has not been set yet, use setClient(new ApolloClient({ ... }, '${clientId}')) to define it`
    );
  }

  return client as ApolloClient<TCache>;
}

export function clearClients(): void {
  CLIENTS.forEach((client) => {
    client.clearStore();
  });
  CLIENTS.clear();
}
