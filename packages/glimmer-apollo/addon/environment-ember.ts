import { setEnviromentContext } from './-private/environment';
import { getOwner, setOwner } from '@ember/application';
import { getValue, createCache } from '@glimmer/tracking/primitives/cache';
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

setEnviromentContext({
  getOwner,
  setOwner,
  createCache: createCache as never,
  getValue,
  invokeHelper,
  waitForPromise,
  setHelperManager,
  helperCapabilities,
  isDestroyed,
  isDestroying,
  destroy,
  registerDestructor,
  associateDestroyableChild
});

export function initialize(/* application */): void {
  // empty
}

export default {
  initialize
};
