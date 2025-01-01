import { gql } from '@apollo/client';

export const LIST_POSTS = gql`
  query GetPostsPerCategories($categoryName:String!, $qtyReturned: Int!) {
    posts(first:$qtyReturned, where: {categoryName: $categoryName}) {
      nodes {
        author {
          node {
            id
            name
            customRoles
          }
        }
        title
        content
        date
        modified
        slug
        status
        link
      }
    }
  }
`;