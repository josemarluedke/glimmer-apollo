declare module 'ember-could-get-used-to-this' {
  interface TemplateArgs {
    positional?: unknown[];
    named?: Record<string, unknown>;
  }

  type ConstructorFn<Args extends TemplateArgs> = () => Args;

  class Resource<Args extends TemplateArgs = TemplateArgs> {
    protected args: Args;

    constructor(fn: ConstructorFn<Args>);

    setup?(): void;
    update?(): void;
    teardown?(): void;
  }

  export let use: PropertyDecorator;
}
