export type { Cache } from '@glimmer/validator';

export interface TemplateArgs<
  T extends readonly unknown[] = readonly unknown[]
> {
  positional: T;
  named: Record<string, unknown>;
}

export interface Fastboot {
  isFastBoot: boolean;
  deferRendering(promise: Promise<unknown>): unknown;
}

export declare function IWaitForPromise<T, KindOfPromise extends Promise<T>>(
  promise: KindOfPromise,
  label?: string
): KindOfPromise;
