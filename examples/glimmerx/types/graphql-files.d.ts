declare module '*.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;

  export default defaultDocument;
}

declare module '*.gql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;

  export default defaultDocument;
}
