import { gql } from '@apollo/client';

export const LIST_POSTS = gql`

query GetPostsPerCategories($categoryName: String, $first: Int, $after: String) {
  posts(where: { categoryName: $categoryName }, first: $first, after: $after) {
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
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

export const INFO_POSTS = gql`
  query GetPostsCategoryInfos($categoryName: String, $postPerPage: Int) {
    postsCategoryInfos(categoryName: $categoryName, postsPerPage: $postPerPage) {
      postsCountByCategoryName
      postsPagesByCategoryName
    }
  }
`;