import { invokeHelper, getValue } from '../environment';
import type { Resource } from './resource';
import type { TemplateArgs } from './types';
import type { Cache } from '@glimmer/tracking/primitives/cache';

type Args = TemplateArgs | TemplateArgs['positional'] | TemplateArgs['named'];

function normalizeArgs(args: Args): TemplateArgs {
  if (Array.isArray(args)) {
    return { positional: args, named: {} };
  }

  if ('positional' in args || 'named' in args) {
    return {
      positional: (args.positional as TemplateArgs['positional']) || [],
      named: (args.named as TemplateArgs['named']) || {}
    };
  }

  if (typeof args === 'object') {
    return { named: args as TemplateArgs['named'], positional: [] };
  }

  return args;
}

export function useUnproxiedResource<
  TArgs = Args,
  T extends Resource<TemplateArgs> = Resource<TemplateArgs>
>(destroyable: object, definition: object, args?: () => TArgs): { value: T } {
  let resource: Cache<T>;

  return {
    get value(): T {
      if (!resource) {
        resource = invokeHelper(
          destroyable,
          definition, // eslint-disable-line
          () => {
            return normalizeArgs(args?.() || {});
          }
        ) as Cache<T>;
      }

      return getValue<T>(resource)!; // eslint-disable-line
    }
  };
}

export function useResource<
  TArgs = Args,
  T extends Resource<TemplateArgs> = Resource<TemplateArgs>
>(destroyable: object, definition: object, args?: () => TArgs): T {
  const target = useUnproxiedResource<TArgs, T>(destroyable, definition, args);

  return new Proxy(target, {
    get(target, key): unknown {
      const instance = target.value;
      const value = Reflect.get(instance, key, instance);

      return typeof value === 'function' ? value.bind(instance) : value;
    },
    ownKeys(target): (string | symbol)[] {
      return Reflect.ownKeys(target.value);
    },
    getOwnPropertyDescriptor(target, key): PropertyDescriptor | undefined {
      return Reflect.getOwnPropertyDescriptor(target.value, key);
    }
  }) as never as T;
}
