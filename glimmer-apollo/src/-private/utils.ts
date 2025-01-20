import { getOwner } from '../environment.ts';
import type { Fastboot } from './types';

function hasFastBoot(obj: unknown): obj is { FastBoot: unknown } {
  return Object.prototype.hasOwnProperty.call(obj, 'FastBoot');
}

function ownerHasLookup(
  owner: object | undefined,
): owner is { lookup: unknown } {
  return !!(owner && 'lookup' in owner);
}

export function getFastboot(ctx: object): Fastboot | undefined {
  if (
    typeof self != 'undefined' &&
    hasFastBoot(self) &&
    typeof self.FastBoot !== 'undefined'
  ) {
    const owner = getOwner(ctx) as object | undefined;

    if (ownerHasLookup(owner) && typeof owner.lookup === 'function') {
      return owner.lookup('service:fastboot') as Fastboot; // eslint-disable-line @typescript-eslint/no-unsafe-call
    }
  }

  return undefined;
}

export function createPromise(): [
  Promise<void>,
  (() => void) | undefined,
  (() => void) | undefined,
] {
  let resolvePromise: (val?: void | Promise<void>) => unknown;
  let rejectPromise: (val?: undefined) => unknown;
  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return [promise, resolvePromise!, rejectPromise!];
}

export function settled(promise?: Promise<unknown>): Promise<void> {
  return new Promise<void>((resolve) => {
    if (promise) {
      promise.then(() => resolve()).catch(() => resolve());
    } else {
      resolve();
    }
  });
}
