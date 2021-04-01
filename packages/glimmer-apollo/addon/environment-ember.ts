import { setEnviromentContext } from './-private/environment';
import { Resource } from 'ember-could-get-used-to-this';
import { getOwner, setOwner } from '@ember/application';
import { getValue } from '@glimmer/tracking/primitives/cache';
import { invokeHelper } from '@ember/helper';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import { waitForPromise } from '@ember/test-waiters';

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

export function initialize(/* application */): void {
  // empty
}

export default {
  initialize
};
