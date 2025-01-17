import { assert } from '@ember/debug';
import {
  setHelperManager,
  helperCapabilities,
  createCache,
  getValue,
  setOwner,
  destroy,
  registerDestructor,
  associateDestroyableChild
} from '../environment.ts';
import type { TemplateArgs } from './types';
type Cache<T> = ReturnType<typeof createCache<T>>;
import type Owner from '@ember/owner';

type HelperDefinition<
  T = unknown,
  Args extends TemplateArgs<readonly unknown[]> = TemplateArgs<
    readonly unknown[]
  >
> = new (owner: Owner, args: Args) => Resource<Args> & {};

type Thunk = (...args: any[]) => void; // eslint-disable-line

export abstract class Resource<
  Args extends TemplateArgs<readonly unknown[]> = TemplateArgs<
    readonly unknown[]
  >
> {
  protected readonly args!: Args;

  constructor(ownerOrThunk: Owner | Thunk, args: Args) {
    if (typeof ownerOrThunk === 'function') {
      // @ts-expect-error This is naughty.
      return { definition: this.constructor, args: ownerOrThunk };
    }

    setOwner(this, ownerOrThunk as Owner);
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
  }) as never;

  private readonly owner?: Owner;

  constructor(owner?: Owner) {
    this.owner = owner;
  }

  createHelper<
    Args extends TemplateArgs<readonly unknown[]> = TemplateArgs<
      readonly unknown[]
    >
  >(
    definition: {Class: HelperDefinition<new (owner: Owner, args: Args) => Resource>, owner: Owner} | HelperDefinition<new (owner: Owner, args: Args) => Resource>,
    args: Args
  ): Cache<Resource> {
    let owner = this.owner;
    let Class: HelperDefinition<new (owner: Owner, args: Args) => Resource>;

    if ('Class' in definition) {
      Class = definition.Class;
      if (definition.owner) {
        owner = definition.owner
      }
    } else {
      Class = definition;
    }

    assert("Cannot create resource without an owner", owner);

    const { update, teardown } = Class.prototype as Resource;

    const hasUpdate = typeof update === 'function';
    const hasTeardown = typeof teardown === 'function';


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
    const instance = getValue<Resource>(cache);

    return instance;
  }

  getDestroyable(cache: Cache<Resource>): Cache<Resource> {
    return cache;
  }

  //eslint-disable-next-line
  getDebugName(fn: (...args: any[]) => void): string {
    return fn.name || '(anonymous function)';
  }
}

function setupInstance<T extends Resource<TemplateArgs<readonly unknown[]>>>(
  cache: Cache<T>,
  Class: HelperDefinition<
    new (owner: Owner, args: TemplateArgs<readonly unknown[]>) => T
  >,
  owner: Owner,
  args: TemplateArgs<readonly unknown[]>,
  hasTeardown: boolean
): T {
  const instance = new Class(owner, args);
  associateDestroyableChild(cache, instance);
  instance.setup();

  if (hasTeardown) {
    registerDestructor(instance, () => instance.teardown!()); // eslint-disable-line
  }

  return instance as T;
}

setHelperManager(
  (owner: Owner | undefined) => {
    return new ResourceManager(owner)
  },
  Resource
);

export const ResourceManagerFactory = (owner: Owner | undefined) => {
  return new ResourceManager(owner);
};
