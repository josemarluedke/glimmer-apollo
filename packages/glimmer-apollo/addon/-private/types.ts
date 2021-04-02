export type { Cache } from '@glimmer/validator';

export interface TemplateArgs {
  positional: readonly unknown[];
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
