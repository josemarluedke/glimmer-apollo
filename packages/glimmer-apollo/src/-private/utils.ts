import { getOwner } from '../environment';
import type { Fastboot } from './types';

function hasFastBoot(obj: unknown): obj is { FastBoot: unknown } {
  return Object.prototype.hasOwnProperty.call(obj, 'FastBoot');
}

function ownerHasLookup(
  owner: object | undefined
  //eslint-disable-next-line
): owner is { lookup: unknown } {
  return !!(owner && 'lookup' in owner);
}

export function getFastboot(ctx: Object): Fastboot | undefined {
  if (
    typeof self != 'undefined' &&
    hasFastBoot(self) &&
    typeof self.FastBoot !== 'undefined'
  ) {
    const owner = getOwner(ctx);

    if (ownerHasLookup(owner) && typeof owner.lookup === 'function') {
      return owner.lookup('service:fastboot') as Fastboot;
    }
  }

  return undefined;
}

export function createPromise(): [
  Promise<void>,
  (() => void) | undefined,
  (() => void) | undefined
] {
  let resolvePromise: (val?: unknown) => void | undefined;
  let rejectPromise: (val?: undefined) => void | undefined;
  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

    return [promise, resolvePromise!, rejectPromise!]; //eslint-disable-line
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
