import Component, { hbs } from '@glimmerx/component';
import Notes from './Notes';
import TutorialNotes from './tutorial/Notes';
import './App.css';
import { Router } from './Router';

export default class App extends Component<{}> {
  static template = hbs`
    <div class="max-w-screen-lg mx-auto px-6 flex flex-col min-h-screen">
      <h1 class="text-3xl font-bold py-4 text-center">Notes</h1>

      <Router class="flex-grow flex flex-col" as |Route|>
        <Route @path='/'>
          <Notes class="flex-grow mb-10" />
        </Route>
        <Route @path='/notes/add'>ADD</Route>
        <Route @path='/tutorial'>
          <TutorialNotes />
        </Route>
      </Router>
    </div>
  `;
}
