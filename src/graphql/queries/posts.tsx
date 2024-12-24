import { gql } from '@apollo/client';

export const LIST_POSTS = gql`
  query GetAllPosts {
    posts {
      nodes {
        author {
          node {
            id
            name
            customRoles
          }
        }
        featuredImageDatabaseId
        title
        content
        date
        modified
        slug
        uri
        status
        link
      }
    }
  }
`;