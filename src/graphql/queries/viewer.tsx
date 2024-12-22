import { gql } from '@apollo/client';

export const VIEWER_QUERY = gql`
  query Viewer {
    viewer {
      id
      name
      email
    }
  }
`;
