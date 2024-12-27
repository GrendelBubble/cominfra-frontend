import { gql } from "@apollo/client";

export const SITE_INFO_QUERY = gql`
  query SiteInfo {
    allSettings {
      generalSettingsTitle
      generalSettingsDescription
    }
    siteIconLink
  }
`;
