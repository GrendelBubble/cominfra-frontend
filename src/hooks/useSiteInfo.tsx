// src/hooks/useSiteInfo.ts
import { useState, useEffect } from 'react';
import client from '../lib/apollo-client';
import { gql } from '@apollo/client';

const SITE_INFO_QUERY = gql`
  query MyQuery {
    allSettings {
      generalSettingsTitle
      generalSettingsDescription
    }
  }
`;

export const useSiteInfo = () => {
  const [siteInfo, setSiteInfo] = useState({ title: '', description: '' });

  const fetchSiteInfo = async () => {
    try {
      const response = await client.query({
        query: SITE_INFO_QUERY,
      });
      const { generalSettingsTitle, generalSettingsDescription } = response.data.allSettings;
      setSiteInfo({ title: generalSettingsTitle, description: generalSettingsDescription });
    } catch (err) {
      console.error('Error fetching site info:', err);
    }
  };

  useEffect(() => {
    fetchSiteInfo();
  }, []);

  return siteInfo;
};
