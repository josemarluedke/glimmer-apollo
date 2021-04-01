import { setEnviromentContext } from './-private/environment';
import { Resource } from 'ember-could-get-used-to-this';
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

import type { IResource as IResource } from './-private/types';

setEnviromentContext({
  Resource: (Resource as never) as typeof IResource,
  getOwner,
  setOwner,
  createCache,
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
