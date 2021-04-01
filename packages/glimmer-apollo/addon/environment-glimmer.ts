import { setEnviromentContext } from './-private/environment';
import { Resource } from 'ember-could-get-used-to-this';
import { getOwner, setOwner } from '@glimmer/owner';
import { getValue, createCache } from '@glimmer/validator';
import { invokeHelper } from '@glimmer/runtime';
import { setHelperManager, helperCapabilities } from '@glimmer/manager';
import {
  isDestroying,
  isDestroyed,
  destroy,
  registerDestructor,
  associateDestroyableChild
} from '@glimmer/destroyable';

function waitForPromise<T>(promise: T): T {
  return promise;
}

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
