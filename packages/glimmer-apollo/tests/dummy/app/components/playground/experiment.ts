import Component from '@glimmer/component';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'glimmer-apollo';

const USER_INFO = gql`
  query GetUserInfo {
    user {
      username
      firstName
    }
  }
`;

const LOGIN = gql`
  mutation Login($username: String!) {
    login(username: $username) {
      id
      firstName
    }
  }
`;

export default class PlaygroundExperiment extends Component {
  userInfo = useQuery(this, () => [USER_INFO]);
  login = useMutation(this, () => [
    LOGIN,
    {
      variables: {
        // username: 'non-existing'
      },
      onComplete(data) {
        console.log('OnComplete', data);
      }
    }
  ]);

  bla = (): void => {
    this.login.mutate();
  };
}
