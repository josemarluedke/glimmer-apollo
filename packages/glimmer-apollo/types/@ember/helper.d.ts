declare module '@ember/helper' {
  type Cache<T = unknown> = {};

  export interface TemplateArgs {
    positional?: unknown[];
    named?: Record<string, unknown>;
  }

  export type HelperDefinition = object;

  export function invokeHelper<T = unknown>(
    parentDestroyable: unknown,
    definition: HelperDefinition,
    computeArgs?: (context: object) => TemplateArgs
  ): Cache<T>;
}
