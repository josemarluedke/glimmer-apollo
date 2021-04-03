import Component, { hbs } from '@glimmerx/component';
import 'glimmer-apollo/environment-glimmer';
import createApollo from './apollo';
import { useQuery } from 'glimmer-apollo';
import { gql } from '@apollo/client/core';
import './App.css';

export default class App extends Component {
  constructor(owner, args) {
    super(owner, args);
    createApollo();
  }

  static template = hbs`
    <h1>hello, glimmer!</h1>
    <Todos />
  `;
}

export class Todos extends Component {
  todos = useQuery(this, () => [
    gql`
      query($isDone: Boolean) {
        todos(isDone: $isDone) {
          id
          description
        }
      }
    `,
    {
      variables: { isDone: this.isDone }
    }
  ]);

  static template = hbs`
    Loading: {{this.todos.loading}}
    <br />
    Error: {{this.todos.error}}
  `;
}
