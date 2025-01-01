import { gql } from '@apollo/client';

// Requête GraphQL pour récupérer un post spécifique via son slug
export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    postBy(slug: $slug) {
      title
      content
      date
      slug
    }
  }
`;

//featuredImageDatabaseId
//modified
//link