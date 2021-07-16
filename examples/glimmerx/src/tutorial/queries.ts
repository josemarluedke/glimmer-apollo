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

export type GetNotesQuery = {
  __typename?: 'Query';
  notes: {
    __typename?: 'Note';
    id: string;
    title: string;
    description: string;
  }[];
};

export type GetNotesQueryVariables = {
  isArchived?: boolean | null;
};
