import { action } from '@ember/object';
import { waitFor } from '@ember/test-waiters';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { useQuery, useMutation, gql } from 'glimmer-apollo';

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

interface Args {
  onDidUpdate?: () => void;
}

export default class PlaygroundExperiment extends Component<Args> {
  @tracked filterIds = ['1', '2', '3'];

  colorsQuery = useQuery(this, () => [
    COLORS,
    {
      fetchPolicy: 'network-only',
      variables: {
        ids: this.filterIds
      }
    }
  ]);

  updateColorMutation = useMutation(this, () => [
    UPDATE_COLOR,
    {
      refetchQueries: ['Colors'],
      awaitRefetchQueries: true
    }
  ]);

  onDidUpdate = (): void => {
    if (typeof this.args.onDidUpdate === 'function') {
      this.args.onDidUpdate();
    }
  };

  @action async onFilter(): Promise<void> {
    this.filterIds = ['1'];
  }

  @action @waitFor async onUpdateColor(colorId: string): Promise<void> {
    await this.updateColorMutation.mutate({
      id: colorId,
      color: 'white'
    });
  }
}
