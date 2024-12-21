import React, { useState, useEffect, FormEvent } from 'react';
import { gql, useMutation, ApolloError } from '@apollo/client';
import { useRouter } from 'next/router';
import client from '../../lib/apollo-client';
import ErrorMessage from '../../components/ErrorMessage';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
}

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
    }
  }
`;

const VIEWER_QUERY = gql`
  query Viewer {
    viewer {
      id
      name
      email
    }
  }
`;

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apolloError, setApolloError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUsername = localStorage.getItem('username') || '';
    setUsername(savedUsername);
  }, []);

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    client: client,
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
          router.push('/'); // Redirection vers la page d'accueil
        })
        .catch((err) => console.error('Error fetching viewer data:', err));
    },
    onError: (error) => {
      setValidationError(null);
      setApolloError(formatErrorMessage(error));
    },
  });

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApolloError(null);

    if (!username || !password) {
      setValidationError('Les champs d\'identifiant et de mot de passe ne peuvent pas être vides.');
      return;
    }

    localStorage.setItem('username', username);
    login({ variables: { username, password } });
  };

  const formatErrorMessage = (error: ApolloError) => {
    const message = error.message
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
    return message;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-2xl mb-5">Connexion</h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
          <form onSubmit={handleLogin} className="px-5 py-7">
            <div className="mb-4">
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Nom d'utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
            >
              <span className="inline-block mr-2">Se connecter</span>
            </button>
            {validationError && <ErrorMessage message={validationError} />}
            {apolloError && <ErrorMessage message={apolloError} />}
          </form>
          <div className="px-5 py-5 text-center text-sm text-gray-500">
            <p>
              Mot de passe oublié ?{' '}
              <a href="/forgot-password" className="text-blue-500 underline">
                Cliquez ici
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
