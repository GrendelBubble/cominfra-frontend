import { gql } from '@apollo/client';

export const LIST_CATEGORIES = gql`
  query GetFilteredCategories {
    categories(
      where: { parent: null, exclude: "1", orderby: DESCRIPTION, order: ASC }
    ) {
      nodes {
        name
      }
    }
  }
`;
