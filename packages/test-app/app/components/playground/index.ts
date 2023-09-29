import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Playground extends Component {
  @tracked isExperimenting = false;

  toggle = (): void => {
    this.isExperimenting = !this.isExperimenting;
  };
}
