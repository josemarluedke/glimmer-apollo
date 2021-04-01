export { tracked } from '@glimmer/tracking';
import { DEBUG } from '@glimmer/env';
import type {
  IResource,
  IInvokeHelper,
  IGetValue,
  IWaitForPromise
} from './types';

interface EnviromentContext {
  Resource: typeof IResource;
  setOwner: (object: any, owner: any) => void; // eslint-disable-line
  getOwner: (object: any) => any; // eslint-disable-line
  getValue: typeof IGetValue;
  invokeHelper: typeof IInvokeHelper;
  isDestroying: (destroyable: object) => boolean; // eslint-disable-line
  isDestroyed: (destroyable: object) => boolean; // eslint-disable-line
  waitForPromise: typeof IWaitForPromise;
}

export let Resource: EnviromentContext['Resource'];
export let getOwner: EnviromentContext['getOwner'];
export let setOwner: EnviromentContext['setOwner'];
export let getValue: EnviromentContext['getValue'];
export let invokeHelper: EnviromentContext['invokeHelper'];
export let isDestroyed: EnviromentContext['isDestroyed'];
export let isDestroying: EnviromentContext['isDestroying'];
export let waitForPromise: EnviromentContext['waitForPromise'];

let environmentContextWasSet = false;

export function setEnviromentContext(env: EnviromentContext): void {
  if (DEBUG) {
    if (environmentContextWasSet) {
      throw new Error(
        'Attempted to set the glimmer-apollo environment context twice. This should only be set once.'
      );
    }

    environmentContextWasSet = true;
  }

  Resource = env.Resource;
  setOwner = env.setOwner;
  getOwner = env.getOwner;
  getValue = env.getValue;
  invokeHelper = env.invokeHelper;
  isDestroying = env.isDestroying;
  isDestroyed = env.isDestroyed;
  waitForPromise = env.waitForPromise;
}
