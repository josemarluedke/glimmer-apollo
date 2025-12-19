import Component from '@glimmer/component';
import { useQuery, useMutation, gql } from 'glimmer-apollo';
import { on } from '@ember/modifier';
import type {
  UserInfoQuery,
  UserInfoQueryVariables,
  LoginMutation,
  LoginMutationVariables,
} from 'test-app/mocks/handlers';

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
  userInfo = useQuery<UserInfoQuery, UserInfoQueryVariables>(this, () => [
    USER_INFO,
    {
      variables: { id: '1-with-delay' },
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
  ]);

  userInfoWithSkip = useQuery<UserInfoQuery, UserInfoQueryVariables>(
    this,
    () => [
      USER_INFO,
      {
        variables: { id: '1-with-delay' },
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        skip: true,
      },
    ]
  );

  login = useMutation<LoginMutation, LoginMutationVariables>(this, () => [
    LOGIN,
    {
      variables: {
        username: undefined as never,
      },
      errorPolicy: 'all',
    },
  ]);

  bla = (): void => {
    this.login.mutate();
  };

  <template>
    <h2 data-test-id="experiment">
      User Info
    </h2>

    loading:
    {{this.userInfo.loading}}
    <br />
    firstName:
    {{this.userInfo.data.user.firstName}}

    {{#if this.userInfo.error}}
      Error:
      {{this.userInfo.error.message}}
    {{/if}}
    <button type="button" {{on "click" this.userInfo.refetch}}>
      refetch
    </button>

    <hr />
    <h2 data-test-id="experiment">
      User Info w/ skip
    </h2>

    loading:
    {{this.userInfoWithSkip.loading}}
    <br />
    firstName:
    {{this.userInfoWithSkip.data.user.firstName}}

    {{#if this.userInfoWithSkip.error}}
      Error:
      {{this.userInfoWithSkip.error.message}}
    {{/if}}
    <button type="button" {{on "click" this.userInfoWithSkip.refetch}}>
      refetch
    </button>

    <hr />
    <h2>
      Login
    </h2>
    <button type="button" {{on "click" this.bla}}>
      Login
    </button>

    <br />
    loading:
    {{this.login.loading}}

    <br />
    firstName:
    {{this.login.data.login.firstName}}

    {{#if this.login.error}}
      Error:
      {{this.login.error.message}}
    {{/if}}
  </template>
}
