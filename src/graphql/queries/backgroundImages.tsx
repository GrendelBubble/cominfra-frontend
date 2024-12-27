import { gql } from '@apollo/client';

export const LIST_BACKGROUNDIMAGES = gql`
  query GetMedia($slugs: [String!]) {
    mediaItems(where: { nameIn: $slugs }) {
      nodes {
        link
        caption
        slug
      }
    }
  }
`;
