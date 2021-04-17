import Component, { hbs } from '@glimmerx/component';
import Notes from './Notes';
import './App.css';

export default class App extends Component<{}> {
  static template = hbs`
    <div class="max-w-screen-lg mx-auto px-6 flex flex-col min-h-screen">
      <h1 class="text-3xl font-bold py-4 text-center">Notes</h1>
      <Notes class="flex-grow mb-10" />
    </div>
  `;
}
