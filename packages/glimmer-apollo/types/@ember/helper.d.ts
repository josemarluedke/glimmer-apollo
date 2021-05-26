declare module '@ember/helper' {
  export {
    setHelperManager,
    helperCapabilities as capabilities
  } from '@glimmer/manager';

  export { invokeHelper } from '@glimmer/runtime';
}
