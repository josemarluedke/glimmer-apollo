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

export type Maybe<T> = T | null;

export type CreateNoteMutation = { __typename?: 'Mutation' } & {
  createNote?: Maybe<
    { __typename?: 'Note' } & { id: string; title: string; description: string }
  >;
};

export type NoteInput = {
  title: string;
  description: string;
  isArchived: Maybe<boolean>;
};

export type CreateNoteMutationVariables = {
  input: NoteInput;
};
