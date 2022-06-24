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

type Message = {
  id: string;
  message: string;
  __typename?: string;
};

type Color = {
  id: string;
  color: string;
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

export type ColorsQuery = {
  __typename?: 'Query';
  colors: Array<{ __typename?: 'Colors' } & Pick<Color, 'id' | 'color'>>;
};

export type ColorsQueryVariables = Exact<{
  ids: string[];
}>;

export type UpdateColorMutation = {
  __typename?: 'Mutation';
  updateColor: Maybe<{ __typename?: 'Color' } & Pick<Color, 'id' | 'color'>>;
};

export type UpdateColorMutationVariables = Exact<{
  id: string;
  color: string;
}>;

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
    lastName: 'McCoy'
  },
  {
    id: '2',
    firstName: 'Joth',
    lastName: 'Maverick'
  }
];

const COLORS: Color[] = [
  { id: '1', color: 'red' },
  { id: '2', color: 'green' },
  { id: '3', color: 'blue' },
  { id: '4', color: 'yellow' }
];

export const handlers = [
  graphql.query<UserInfoQuery, UserInfoQueryVariables>('UserInfo', (
    req,
    res,
    ctx
  ) => {
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
            message: 'User not found'
          }
        ])
      );
    }
  }),

  // Capture a "Login" mutation
  graphql.mutation('Login', (req, res, ctx) => {
    const { username } = req.variables;

    if (username === 'non-existing') {
      return res(
        ctx.errors([
          {
            message: 'User not found with given username'
          }
        ])
      );
    }

    if (username === 'with-error') {
      return res(
        ctx.errors([
          {
            message: 'Error with Data'
          }
        ]),
        ctx.data({
          login: {
            __typename: 'User',
            ...USERS[1]
          }
        })
      );
    }

    return res(
      ctx.data({
        login: {
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

          id: '1',
          firstName: 'John',
          lastName: 'Maverick',
          username: 'joth'
        }
      })
    );
  }),

  // Handles a "Colors" query
  graphql.query<ColorsQuery, ColorsQueryVariables>('Colors', (
    args,
    res,
    ctx
  ) => {
    return res(
      ctx.delay(300),
      ctx.data({
        colors: args.variables?.ids?.length
          ? [...COLORS.filter((color) => args.variables.ids.includes(color.id))]
          : [...COLORS]
      })
    );
  }),

  // Handles "UpdateColor" mutation
  graphql.mutation<UpdateColorMutation, UpdateColorMutationVariables>(
    'UpdateColor',
    (req, res, ctx) => {
      const color = COLORS.find((color) => color.id === req.variables.id);
      if (color) {
        color.color = req.variables.color;
      }
      return res(
        ctx.data({
          updateColor: {
            __typename: 'Color',
            id: req.variables.id,
            color: req.variables.color
          }
        })
      );
    }
  )
];
