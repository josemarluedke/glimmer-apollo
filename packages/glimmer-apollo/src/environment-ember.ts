import { setEnviromentContext } from './environment';
import { getOwner, setOwner } from '@ember/application';
import ApplicationInstance from '@ember/application/instance';
import { invokeHelper } from '@ember/helper';
import {
  isDestroying,
  isDestroyed,
  destroy,
  registerDestructor,
  associateDestroyableChild
} from '@ember/destroyable';
import { waitForPromise } from '@ember/test-waiters';

import {
  setHelperManager,
  capabilities as helperCapabilities
} from '@ember/helper';

// Use runtime AMD resolution for @glimmer/tracking/primitives/cache
// This module is provided by ember-source at runtime and can't be statically imported
// in v2 addons without causing webpack resolution issues
const cache = (window as { require?: (id: string) => unknown }).require?.(
  '@glimmer/tracking/primitives/cache'
) as { createCache: unknown; getValue: unknown };

const { createCache, getValue } = cache;

setEnviromentContext({
  owner: ApplicationInstance,
  getOwner,
  setOwner: setOwner as typeof import('@glimmer/owner').setOwner,
  createCache: createCache as never,
  getValue: getValue as never,
  invokeHelper,
  waitForPromise: (...args) => {
    // We create this function to wrap waitForPromise due to error when using
    // addon v2 format and auto-import v2. Originaly, waitForPromise would be undefined.
    return waitForPromise(...args);
  },
  setHelperManager,
  helperCapabilities,
  isDestroyed,
  isDestroying,
  destroy,
  registerDestructor,
  associateDestroyableChild
});

function initialize(/* application */): void {
  // empty
}

export default {
  initialize
};
