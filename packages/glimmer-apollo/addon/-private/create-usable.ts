import { Resource } from 'ember-could-get-used-to-this';
import { invokeHelper, TemplateArgs } from '@ember/helper';
import { getValue, Cache } from '@glimmer/tracking/primitives/cache';

type Thunk =
  | TemplateArgs
  | NonNullable<TemplateArgs['positional']>
  | NonNullable<TemplateArgs['named']>;

function normalizeArgs(args: Thunk): TemplateArgs {
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

export function createUsable<
  TArgs = Thunk,
  T extends Resource<TemplateArgs> = Resource<TemplateArgs>
>(resourceDefinition: unknown) {
  return (parentDestroyable: unknown, args?: () => TArgs): { value: T } => {
    let resource: Cache<T>;

    return {
      get value(): T {
        if (!resource) {
          resource = invokeHelper<T>(
            parentDestroyable,
            resourceDefinition as object, // eslint-disable-line
            () => {
              return normalizeArgs(args?.() || {});
            }
          );
        }

        return getValue(resource);
      }
    };
  };
}

export function createProxiedUsable<
  TArgs = Thunk,
  T extends Resource<TemplateArgs> = Resource<TemplateArgs>
>(resourceDefinition: unknown) {
  return (parentDestroyable: unknown, args?: () => TArgs): T => {
    const target = createUsable<TArgs, T>(resourceDefinition)(
      parentDestroyable,
      args
    );

    return (new Proxy(target, {
      get(target, key): unknown {
        return Reflect.get(target.value, key);
      },
      ownKeys(target): (string | symbol)[] {
        return Reflect.ownKeys(target.value);
      },
      getOwnPropertyDescriptor(target, key): PropertyDescriptor | undefined {
        return Reflect.getOwnPropertyDescriptor(target.value, key);
      }
    }) as never) as T;
  };
}
