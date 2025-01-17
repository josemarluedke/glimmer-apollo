import { graphql, delay, HttpResponse } from 'msw';

type Maybe<T> = T | null;
type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
};

type Message = {
  id: string;
  message: string;
};

export type UserInfoQueryVariables = Exact<{
  id: string;
}>;

export type UserInfoQuery = {
  __typename?: 'Query';
  user: Maybe<
    { __typename?: 'User' } & Pick<User, 'id' | 'firstName' | 'lastName'>
  >;
};

export type LoginMutationVariables = Exact<{
  username: string;
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login: Maybe<
    { __typename?: 'User' } & Pick<User, 'id' | 'firstName' | 'lastName'>
  >;
};

export type OnMessageAddedSubscriptionVariables = Exact<{
  channel: string;
}>;

export type OnMessageAddedSubscription = {
  __typename?: 'Subscription';
  messageAdded: Maybe<
    { __typename?: 'Message' } & Pick<Message, 'id' | 'message'>
  >;
};

const USERS: User[] = [
  {
    id: '1',
    firstName: 'Cathaline',
    lastName: 'McCoy',
  },
  {
    id: '2',
    firstName: 'Joth',
    lastName: 'Maverick',
  },
];

export const handlers = [
  graphql.query<UserInfoQuery, UserInfoQueryVariables>(
    'UserInfo',
    async (req) => {
      const user = USERS[Number(req.variables.id.charAt(0)) - 1];

      if (user && req.variables.id.includes('with-error')) {
        return HttpResponse.json({
          errors: [
            {
              message: 'Data With Error',
            },
          ],
          data: {
            user: {
              __typename: 'User',
              ...user,
            },
          },
        });
      } else if (user && req.variables.id.includes('with-delay')) {
        await delay(300);
        return HttpResponse.json({
          data: {
            user: {
              __typename: 'User',
              ...user,
            },
          },
        });
      } else if (user) {
        return HttpResponse.json({
          data: {
            user: {
              __typename: 'User',
              ...user,
            },
          },
        });
      } else {
        return HttpResponse.json({
          errors: [
            {
              message: 'User not found',
            },
          ],
        });
      }
    }
  ),

  // Capture a "Login" mutation
  graphql.mutation('Login', (req) => {
    const { username } = req.variables;

    if (username === 'non-existing') {
      return HttpResponse.json({
        errors: [
          {
            message: 'User not found with given username',
          },
        ],
      });
    }

    if (username === 'with-error') {
      return HttpResponse.json({
        errors: [
          {
            message: 'Error with Data',
          },
        ],
        data: {
          login: {
            __typename: 'User',
            ...USERS[1],
          },
        },
      });
    }

    return HttpResponse.json({
      data: {
        login: {
          __typename: 'User',
          ...USERS[1],
        },
      },
    });
  }),

  // Handles a "GetUserInfo" query
  graphql.query('GetUserInfo', async () => {
    await delay(300);
    return HttpResponse.json({
      data: {
        user: {
          __typename: 'User',

          id: '1',
          firstName: 'John',
          lastName: 'Maverick',
          username: 'joth',
        },
      },
    });
  }),
];
