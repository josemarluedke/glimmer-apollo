import ApplicationInstance from '@ember/application/instance';
export { tracked } from '@glimmer/tracking';
import { getOwner as _getOwner } from '@ember/application';
export { setOwner } from '@ember/application';
export { getValue, createCache } from '@glimmer/tracking/primitives/cache';
export { invokeHelper } from '@ember/helper';
export {
  isDestroying,
  isDestroyed,
  destroy,
  registerDestructor,
  associateDestroyableChild
} from '@ember/destroyable';
export { waitForPromise } from '@ember/test-waiters';

export {
  setHelperManager,
  capabilities as helperCapabilities
} from '@ember/helper';

export function getOwner<O extends object>(obj: object): O | undefined {
  if (obj instanceof ApplicationInstance) {
    return obj as O;
  }

  return _getOwner(obj) as O;
}
