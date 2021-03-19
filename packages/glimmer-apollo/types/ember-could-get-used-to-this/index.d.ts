declare module 'ember-could-get-used-to-this' {
  import { TemplateArgs } from '@ember/helper';

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
