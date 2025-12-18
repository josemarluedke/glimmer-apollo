import Component from '@glimmer/component';
import Route from 'ember-route-template';
import { pageTitle } from 'ember-page-title';
import Playground from 'test-app/components/playground';
import { getOwner } from '@ember/owner';

class Application extends Component {
  bla = () => {
    console.log('owner in application template', getOwner(this));
  };

  <template>
    {{(this.bla)}}
    {{pageTitle "TestApp"}}
    <Playground />

    {{outlet}}
  </template>
}

export default Route(Application);
