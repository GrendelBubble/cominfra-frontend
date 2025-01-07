import { gql } from '@apollo/client';

export const LIST_CATEGORIES = gql`
query Get_Menus {
  categories(where: {exclude: "1", orderby: SLUG, order: ASC, parent: 0}) {
    edges {
      node {
        description
        id
        name
        slug
        acfCustomFields {
          backgroundImage {
            node {
              mediaItemUrl
            }
          }
          enableContent
          enableExcerpt
          enableFeaturedImage
          enableLinkUrl
          enableMenu
          eventAddress
          eventContact
          eventEmail
          eventEndDate
          eventEndTime
          eventLimitDate
          eventPhone
          eventSite
          eventStartDate
          eventStartTime
          fieldGroupName
          hasAddress
          isEvent
          isMenu
          onlineEvent
          videoConferenceUrl
        }
      }
    }
  }
}
`;
