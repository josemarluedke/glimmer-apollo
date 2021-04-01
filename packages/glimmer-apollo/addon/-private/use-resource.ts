import { invokeHelper, getValue } from './environment';
import type { IResource } from './types';
import type { TemplateArgs, Cache } from './types';

type Args =
  | TemplateArgs
  | NonNullable<TemplateArgs['positional']>
  | NonNullable<TemplateArgs['named']>;

function normalizeArgs(args: Args): TemplateArgs {
  if (Array.isArray(args)) {
    return { positional: args };
  }

  if ('positional' in args || 'named' in args) {
    return args;
  }

  if (typeof args === 'object') {
    return { named: args as TemplateArgs['named'] };
  }

  return args;
}

export function useUnproxiedResource<
  TArgs = Args,
  T extends IResource<TemplateArgs> = IResource<TemplateArgs>
>(destroyable: unknown, definition: unknown, args?: () => TArgs): { value: T } {
  let resource: Cache<T>;

  return {
    get value(): T {
      if (!resource) {
        resource = invokeHelper<T>(
          destroyable,
          definition as object, // eslint-disable-line
          () => {
            return normalizeArgs(args?.() || {});
          }
        );
      }

      return getValue<T>(resource)!; // eslint-disable-line
    }
  };
}

export function useResource<
  TArgs = Args,
  T extends IResource<TemplateArgs> = IResource<TemplateArgs>
>(destroyable: unknown, definition: unknown, args?: () => TArgs): T {
  const target = useUnproxiedResource<TArgs, T>(destroyable, definition, args);

  return (new Proxy(target, {
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
  }) as never) as T;
}
