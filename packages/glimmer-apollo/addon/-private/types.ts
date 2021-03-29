export interface TemplateArgs {
  positional?: unknown[];
  named?: Record<string, unknown>;
}
export type Cache = {}; // eslint-disable-line

export interface Fastboot {
  isFastBoot: boolean;
  deferRendering(promise: Promise<unknown>): unknown;
}
