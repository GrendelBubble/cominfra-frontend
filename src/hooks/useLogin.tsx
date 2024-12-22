// src/hooks/useLogin.ts
import { useState } from 'react';
import { useMutation, ApolloError } from '@apollo/client';
import Cookies from 'js-cookie';
import { LOGIN_MUTATION } from '../graphql/mutations/login';
import { VIEWER_QUERY } from '../graphql/queries/viewer';
import client from '../lib/apollo-client';

export const useLogin = (username: string, password: string) => {
  const [token, setToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apolloError, setApolloError] = useState<string | null>(null);

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const authToken = data.login.authToken;
      setToken(authToken);
      Cookies.set('token', authToken);

      client
        .query({
          query: VIEWER_QUERY,
          context: {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        })
        .then((response) => {
          const user = response.data.viewer;
          setCurrentUser(user);
        })
        .catch((err) => {
          console.error('Error fetching viewer data:', err);
        });
    },
    onError: (error) => {
      setValidationError(null);
      setApolloError(formatErrorMessage(error));
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApolloError(null);

    if (!username || !password) {
      setValidationError('Les champs d\'identifiant et de mot de passe ne peuvent pas être vides.');
      return;
    }

    login({ variables: { username, password } });
  };

  const formatErrorMessage = (error: ApolloError) => {
    return error.message
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  };

  return {
    token,
    currentUser,
    validationError,
    apolloError,
    handleLogin,
    loading,
  };
};
