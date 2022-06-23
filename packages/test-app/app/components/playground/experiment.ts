import Component from '@glimmer/component';
import { useQuery, useMutation, gql } from 'glimmer-apollo';

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

interface Args {
  onDidUpdate?: () => void;
}

export default class PlaygroundExperiment extends Component<Args> {
  userInfo = useQuery(this, () => [
    USER_INFO,
    {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true
    }
  ]);

  login = useMutation(this, () => [
    LOGIN,
    {
      variables: {
        // username: 'non-existing'
      },
      errorPolicy: 'all'
    }
  ]);

  bla = (): void => {
    this.login.mutate();
  };

  onDidUpdate = (): void => {
    if (typeof this.args.onDidUpdate === 'function') {
      this.args.onDidUpdate();
    }
  };
}
