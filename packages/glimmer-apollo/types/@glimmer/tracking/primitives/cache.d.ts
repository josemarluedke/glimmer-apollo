declare module '@glimmer/tracking/primitives/cache' {
  export type Cache<T = unknown> = {}; // eslint-disable-line

  export function createCache<T>(fn: () => T): Cache<T>;

  export function getValue<T>(cache: Cache<T>): T;

  export function isConst(cache: Cache): boolean;
}
