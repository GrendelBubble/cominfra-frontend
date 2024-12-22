import { gql } from '@apollo/client';

export const SITE_INFO_QUERY = gql`
  query MyQuery {
    allSettings {
      generalSettingsTitle
      generalSettingsDescription
    }
  }
`;
