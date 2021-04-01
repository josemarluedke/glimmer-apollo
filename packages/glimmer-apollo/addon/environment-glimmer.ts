import { setEnviromentContext } from './-private/environment';
import { Resource } from 'ember-could-get-used-to-this';
import { getOwner, setOwner } from '@glimmer/owner';
import { getValue } from '@glimmer/validator';
import { invokeHelper } from '@glimmer/runtime';
import { isDestroying, isDestroyed } from '@glimmer/destroyable';

function waitForPromise<T>(promise: T): T {
  return promise;
}

import type { IResource as IResource } from './-private/types';

setEnviromentContext({
  Resource: (Resource as never) as typeof IResource,
  getOwner,
  setOwner,
  getValue,
  invokeHelper,
  isDestroyed,
  isDestroying,
  waitForPromise
});
