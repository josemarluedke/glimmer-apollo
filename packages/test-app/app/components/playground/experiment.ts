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

export default class PlaygroundExperiment extends Component {
  userInfo = useQuery(this, () => [
    USER_INFO,
    {
      variables: { id: '1-with-delay' },
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true
    }
  ]);

  userInfoWithSkip = useQuery(this, () => [
    USER_INFO,
    {
      variables: { id: '1-with-delay' },
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
      skip: true
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
}
