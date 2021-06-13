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
