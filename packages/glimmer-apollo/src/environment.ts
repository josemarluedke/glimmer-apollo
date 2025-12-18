import { DEBUG } from '@glimmer/env';

import type { IWaitForPromise } from './-private/types';
import type { setOwner as ISetOwner } from '@glimmer/owner';

import type {
  setHelperManager as ISetHelperManager,
  helperCapabilities as IHelperCapabilities
} from '@glimmer/manager';

import type {
  isDestroying as IIsDestroying,
  isDestroyed as IIsDestroyed,
  destroy as IDestroy,
  registerDestructor as IRegisterDestructor,
  associateDestroyableChild as IAssociateDestroyableChild
} from '@glimmer/destroyable';

import type { invokeHelper as IInvokeHelper } from '@glimmer/runtime';

import type {
  getValue as IGetValue,
  createCache as ICreateCache
} from '@glimmer/validator';

interface EnviromentContext {
  owner?: object;
  setOwner: typeof ISetOwner;
  getOwner: (object: unknown) => unknown;
  getValue: typeof IGetValue;
  createCache: typeof ICreateCache;
  invokeHelper: typeof IInvokeHelper;
  isDestroying: typeof IIsDestroying;
  isDestroyed: typeof IIsDestroyed;
  destroy: typeof IDestroy;
  registerDestructor: typeof IRegisterDestructor;
  associateDestroyableChild: typeof IAssociateDestroyableChild;
  waitForPromise: typeof IWaitForPromise;
  setHelperManager: typeof ISetHelperManager;
  helperCapabilities: typeof IHelperCapabilities;
}

export let owner: EnviromentContext['owner'];
let _getOwner: EnviromentContext['getOwner'];
export let setOwner: EnviromentContext['setOwner'];
export let createCache: EnviromentContext['createCache'];
export let getValue: EnviromentContext['getValue'];
export let invokeHelper: EnviromentContext['invokeHelper'];
export let isDestroyed: EnviromentContext['isDestroyed'];
export let isDestroying: EnviromentContext['isDestroying'];
export let destroy: EnviromentContext['destroy'];
export let registerDestructor: EnviromentContext['registerDestructor'];
export let associateDestroyableChild: EnviromentContext['associateDestroyableChild'];
export let waitForPromise: EnviromentContext['waitForPromise'];
export let setHelperManager: EnviromentContext['setHelperManager'];
export let helperCapabilities: EnviromentContext['helperCapabilities'];

let environmentContextWasSet = false;

export function getOwner<O extends object>(obj: object): O | undefined {
  // eslint-disable-next-line
  if (typeof owner !== 'undefined' && obj instanceof (owner as any)) {
    return obj as O;
  }

  return _getOwner(obj) as O;
}

export function setEnviromentContext(env: EnviromentContext): void {
  if (DEBUG) {
    if (environmentContextWasSet) {
      throw new Error(
        'Attempted to set the glimmer-apollo environment context twice. This should only be set once.'
      );
    }

    environmentContextWasSet = true;
  }

  owner = env.owner;
  setOwner = env.setOwner;
  _getOwner = env.getOwner;
  createCache = env.createCache;
  getValue = env.getValue;
  invokeHelper = env.invokeHelper;
  waitForPromise = env.waitForPromise;
  setHelperManager = env.setHelperManager;
  helperCapabilities = env.helperCapabilities;

  isDestroying = env.isDestroying;
  isDestroyed = env.isDestroyed;
  destroy = env.destroy;
  registerDestructor = env.registerDestructor;
  associateDestroyableChild = env.associateDestroyableChild;
}
