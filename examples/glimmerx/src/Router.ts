import Component, { hbs, tracked } from '@glimmerx/component';
import { on } from '@glimmerx/modifier';
import Navigo from 'navigo';

let routerInstance: Navigo | undefined;

interface LinkArgs {
  to: string;
}

class Link extends Component<LinkArgs> {
  navigate = (event: MouseEvent): void => {
    event.preventDefault();

    routerInstance?.navigate(this.args.to);
  };

  static template = hbs`
    <a href={{@to}} ...attributes {{on "click" this.navigate}}>{{yield}}</a>
  `;
}

interface RouteArgs {
  path: string;
}

class Route extends Component<RouteArgs> {
  @tracked isCurrent = false;

  constructor(owner: object, args: RouteArgs) {
    super(owner, args);

    routerInstance?.on(
      this.args.path,
      () => {
        this.isCurrent = true;
      },
      {
        leave: (done) => {
          this.isCurrent = false;
          done();
        }
      }
    );
  }

  static template = hbs`
    {{#if this.isCurrent}}{{yield}}{{/if}}
  `;
}

class Router extends Component {
  startNavigo = (): (() => void) => {
    routerInstance?.resolve();

    return (): void => {
      routerInstance?.destroy();
      routerInstance = undefined;
    };
  };

  constructor(owner: object, args: {}) {
    super(owner, args);
    routerInstance = new Navigo('/');
  }

  static template = hbs`
    <div {{this.startNavigo}} ...attributes>
      {{yield Route}}
    </div>
  `;
}

export { Router, Link };
