import { action } from '@ember/object';
import { waitFor } from '@ember/test-waiters';
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

const COLORS = gql`
  query Colors {
    colors {
      id
      color
    }
  }
`;

const UPDATE_COLOR = gql`
  mutation UpdateColor($id: String!, $color: String!) {
    updateColor(id: $id, color: $color) {
      id
      color
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

  colorsQuery = useQuery(this, () => [COLORS]);

  updateColorMutation = useMutation(this, () => [UPDATE_COLOR]);

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

  @action @waitFor async onUpdateColor(colorId: string): Promise<void> {
    await this.updateColorMutation.mutate({
      id: colorId,
      color: 'white'
    });
  }
}
