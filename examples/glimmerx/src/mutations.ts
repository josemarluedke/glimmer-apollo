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

export type CreateNoteMutation = {
  __typename?: 'Mutation';

  createNote?: {
    __typename?: 'Note';
    id: string;
    title: string;
    description: string;
  } | null;
};

export type CreateNoteMutationVariables = {
  input: {
    title: string;
    description: string;
    isArchived?: boolean | null;
  };
};
