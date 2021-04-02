import {
  setHelperManager,
  helperCapabilities,
  createCache,
  getValue,
  setOwner,
  destroy,
  registerDestructor,
  associateDestroyableChild
} from './environment';
import type { TemplateArgs, Cache } from './types';

declare const HELPER_DEFINITION: unique symbol;
type HelperDefinition<T = unknown> = T & {
  readonly [HELPER_DEFINITION]: true;
};
type Owner = unknown;

type Thunk = (...args: any[]) => void; // eslint-disable-line

export abstract class Resource<Args extends TemplateArgs = TemplateArgs> {
  protected readonly args!: Args;

  constructor(ownerOrThunk: Owner | Thunk, args: Args) {
    if (typeof ownerOrThunk === 'function') {
      // @ts-expect-error This is naughty.
      return { definition: this.constructor, args: ownerOrThunk };
    }

    setOwner(this, ownerOrThunk);
    this.args = args;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup(): void {}

  update?(): void;
  teardown?(): void;
}

class ResourceManager {
  readonly capabilities = helperCapabilities('3.23', {
    hasValue: true,
    hasDestroyable: true
  });

  private readonly owner: Owner;

  constructor(owner: Owner) {
    this.owner = owner;
  }

  createHelper<Args extends TemplateArgs = TemplateArgs>(
    Class: HelperDefinition<new (owner: Owner, args: Args) => Resource>,
    args: Args
  ): Cache<Resource> {
    const { update, teardown } = Class.prototype as Resource;

    const hasUpdate = typeof update === 'function';
    const hasTeardown = typeof teardown === 'function';

    const owner = this.owner;

    let instance: Resource | undefined;
    let cache: Cache<Resource>;

    if (hasUpdate) {
      cache = createCache(() => {
        if (instance === undefined) {
          instance = setupInstance(cache, Class, owner, args, hasTeardown);
        } else {
          instance.update!(); // eslint-disable-line
        }

        return instance;
      });
    } else {
      cache = createCache(() => {
        if (instance !== undefined) {
          destroy(instance);
        }

        instance = setupInstance(cache, Class, owner, args, hasTeardown);

        return instance;
      });
    }

    return cache;
  }

  getValue(cache: Cache<Resource>): Resource | undefined {
    const instance = getValue(cache);

    return instance;
  }

  getDestroyable(cache: Cache): Cache {
    return cache;
  }

  //eslint-disable-next-line
  getDebugName(fn: (...args: any[]) => void): string {
    return fn.name || '(anonymous function)';
  }
}

function setupInstance<T extends Resource>(
  cache: Cache,
  Class: new (owner: Owner, args: TemplateArgs) => T,
  owner: Owner,
  args: TemplateArgs,
  hasTeardown: boolean
): T {
  const instance = new Class(owner, args);
  associateDestroyableChild(cache, instance);
  instance.setup();

  if (hasTeardown) {
    registerDestructor(instance, () => instance.teardown!()); // eslint-disable-line
  }

  return instance;
}

setHelperManager((owner: Owner) => new ResourceManager(owner), Resource);
