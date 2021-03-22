import { graphql } from 'msw';

type Maybe<T> = T | null;
type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
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
  user: Maybe<
    { __typename?: 'User' } & Pick<User, 'id' | 'firstName' | 'lastName'>
  >;
};

const USERS: User[] = [
  {
    id: '1',
    firstName: 'Cathaline',
    lastName: 'McCoy'
  },
  {
    id: '2',
    firstName: 'Joth',
    lastName: 'Maverick'
  }
];

export const handlers = [
  graphql.query<UserInfoQuery, UserInfoQueryVariables>(
    'UserInfo',
    (req, res, ctx) => {
      const user = USERS[Number(req.variables.id.charAt(0)) - 1];

      if (user && req.variables.id.includes('with-error')) {
        return res(
          ctx.errors([
            {
              message: 'Data With Error'
            }
          ]),
          ctx.data({
            user: {
              __typename: 'User',
              ...user
            }
          })
        );
      } else if (user) {
        return res(
          ctx.data({
            user: {
              __typename: 'User',
              ...user
            }
          })
        );
      } else {
        return res(
          ctx.errors([
            {
              message: 'User not found',
              extensions: {
                id: 'f79e82e8-c34a-4dc7-a49e-9fadc0979fda'
              }
            }
          ])
        );
      }
    }
  ),

  // Capture a "Login" mutation
  graphql.mutation('Login', (req, res, ctx) => {
    const { username } = req.variables;

    if (username === 'non-existing') {
      return res(
        ctx.errors([
          {
            message: 'User not found with given username',
            extensions: {
              id: 'f79e82e8-c34a-4dc7-a49e-9fadc0979fda'
            }
          }
        ])
      );
    }

    return res(
      ctx.data({
        user: {
          __typename: 'User',
          ...USERS[1]
        }
      })
    );
  }),

  // Handles a "GetUserInfo" query
  graphql.query('GetUserInfo', (_, res, ctx) => {
    return res(
      ctx.delay(2000),
      ctx.data({
        user: {
          __typename: 'User',

          id: 'f79e82e8-c34a-4dc7-a49e-9fadc0979fda',
          firstName: 'John',
          lastName: 'Maverick'
        }
      })
    );
  })
];
