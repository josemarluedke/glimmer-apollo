import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier/on';
import Experiment from './experiment';

export default class Playground extends Component {
  @tracked isExperimenting = false;

  toggle = (): void => {
    this.isExperimenting = !this.isExperimenting;
  };

  <template>
    <button type="button" {{on "click" this.toggle}} dates-test-id="toggle">
      Toggle Experiment
    </button>

    <br />
    <hr />
    <br />

    {{#if this.isExperimenting}}
      <Experiment />
    {{/if}}
  </template>
}
