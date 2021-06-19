import { gql } from 'glimmer-apollo';

export const CREATE_NOTE = gql`
  mutation CreateNote($input: NoteInput!) {
    createNote(input: $input) {
      id
      title
      description
    }
  }
`;
