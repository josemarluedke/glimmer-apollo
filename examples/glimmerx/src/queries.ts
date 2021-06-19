import { gql } from 'glimmer-apollo';

export const GET_NOTES = gql`
  query GetNotes($isArchived: Boolean) {
    notes(isArchived: $isArchived) {
      id
      title
      description
    }
  }
`;

export type Maybe<T> = T | null;

export type GetNotesQueryVariables = {
  isArchived?: Maybe<boolean>;
};

export type GetNotesQuery = { __typename?: 'Query' } & {
  notes: { __typename?: 'Note' } & {
    id: string;
    title: string;
    description: string;
  }[];
};
