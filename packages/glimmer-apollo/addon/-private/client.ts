import type { ApolloClient } from '@apollo/client/core';

const CLIENTS: Map<string, unknown> = new Map();

export function setClient<TCache = unknown>(
  client: ApolloClient<TCache>,
  name?: string
): void {
  if (typeof name === 'undefined') {
    name = 'default';
  }

  CLIENTS.set(name, client);
}

export function getClient<TCache = unknown>(
  name?: string
): ApolloClient<TCache> {
  if (typeof name === 'undefined') {
    name = 'default';
  }

  const client = CLIENTS.get(name);

  if (!client) {
    throw new Error(
      `${name} ApolloClient has not been set yet, use setClient(new ApolloClient({ ... }, '${name}')) to define it`
    );
  }

  return client as ApolloClient<TCache>;
}

export function clearClients(): void {
  CLIENTS.clear();
}
