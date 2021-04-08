import {
  renderComponent as glimmerRenderComponent,
  ComponentDefinition,
  RenderComponentOptions,
  didRender
} from '@glimmerx/core';
import createApollo from '../src/apollo';
import { clearClients } from 'glimmer-apollo';

// Bootstrap QUnit
import 'qunit';
import 'qunit/qunit/qunit.css';
import 'qunit-dom/dist/qunit-dom';
import { startServer } from '../src/mock/server';

QUnit.start();

const getTestRoot = (): HTMLElement =>
  document.getElementById('qunit-fixture')!;

// Setup QUnit.dom
Object.defineProperty(QUnit.assert.dom, 'rootElement', { get: getTestRoot });

// This renderComponent helper will automatically find the root of the test
// context and render to it, so you don't have to do that for every test. You
// can still override the element by passing it directly, in cases where that
// is necessary.
export async function renderComponent(
  component: ComponentDefinition,
  elementOrOptions: HTMLElement | Partial<RenderComponentOptions> = {}
): Promise<void> {
  let options: RenderComponentOptions;

  if (elementOrOptions instanceof HTMLElement) {
    options = { element: elementOrOptions };
  } else {
    const element =
      elementOrOptions.element instanceof HTMLElement
        ? elementOrOptions.element
        : getTestRoot();

    options = { ...elementOrOptions, element };
  }

  await glimmerRenderComponent(component, options);
}

export function setupApollo(hooks: NestedHooks): void {
  hooks.beforeEach(() => {
    createApollo();
  });
  hooks.afterEach(() => {
    clearClients();
  });
}

export function setupMirage(
  hooks: NestedHooks
): { server: ReturnType<typeof startServer> } {
  let server: ReturnType<typeof startServer> | undefined;

  hooks.beforeEach(function () {
    server = startServer('test');
  });

  hooks.afterEach(function () {
    if (server) {
      server.shutdown();
      server = undefined;
    }
  });

  return {
    get server(): ReturnType<typeof startServer> {
      return server || startServer('test');
    }
  };
}

// re-export QUnit modules for convenience
export const module = QUnit.module;
export const test = QUnit.test;

// Re-export didRender for convenience
export { didRender };
