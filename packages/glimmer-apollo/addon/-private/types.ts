export interface TemplateArgs {
  positional: readonly unknown[];
  named: Record<string, unknown>;
}

// eslint-disable-next-line
// @ts-ignore
export type Cache<T = unknown> = {}; //eslint-disable-line

export interface Fastboot {
  isFastBoot: boolean;
  deferRendering(promise: Promise<unknown>): unknown;
}
type ConstructorFn<Args extends TemplateArgs> = () => Args;

export declare class IResource<Args extends TemplateArgs = TemplateArgs> {
  protected args: Args;

  constructor(fn: ConstructorFn<Args>);

  setup?(): void;
  update?(): void;
  teardown?(): void;
}

type HelperDefinition = object; //eslint-disable-line

export declare function IInvokeHelper<T = unknown>(
  parentDestroyable: unknown,
  definition: HelperDefinition,
  computeArgs?: (context: object) => TemplateArgs // eslint-disable-line
): Cache<T>;

export declare function ICreateCache<T>(
  fn: () => T,
  debuggingLabel?: string | false
): Cache<T>;
export declare function IGetValue<T>(cache: Cache<T>): T | undefined;

export declare function IWaitForPromise<T, KindOfPromise extends Promise<T>>(
  promise: KindOfPromise,
  label?: string
): KindOfPromise;
