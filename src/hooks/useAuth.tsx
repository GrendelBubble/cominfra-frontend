// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import client from '../lib/apollo-client';
import { gql } from '@apollo/client';

const VIEWER_QUERY = gql`
  query Viewer {
    viewer {
      id
      name
      email
    }
  }
`;

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const checkLoginStatus = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const response = await client.query({
          query: VIEWER_QUERY,
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
        setCurrentUser(response.data.viewer);
        setIsLoggedIn(true);
      } catch (err) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return { isLoggedIn, currentUser, checkLoginStatus };
};
