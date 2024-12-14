"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { gql, useMutation, ApolloError } from '@apollo/client';
import client from '../../lib/apollo-client';
import ErrorMessage from '../../components/ErrorMessage';

interface User {
  id: string;
  name: string;
  email: string;
}

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: {username: $username, password: $password}) {
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

  useEffect(() => {
    const savedUsername = localStorage.getItem('username') || '';
    const savedPassword = localStorage.getItem('password') || '';
    setUsername(savedUsername);
    setPassword(savedPassword);
  }, []);

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    client: client,
    onCompleted: (data) => {
      const authToken = data.login.authToken;
      setToken(authToken);

      // Récupérer les informations de l'utilisateur connecté
      client
        .query({
          query: VIEWER_QUERY,
          context: {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        })
        .then((response) => {
          const user = response.data.viewer;
          setCurrentUser(user);
        })
        .catch((err) => console.error('Error fetching viewer data:', err));
    },
    onError: (error) => {
      setValidationError(null); // Reset validation error
      setApolloError(formatErrorMessage(error));
    }
  });

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null); // Reset validation error
    setApolloError(null); // Reset Apollo error

    // Vérifier si les champs d'identifiant et de mot de passe sont vides
    if (!username || !password) {
      setValidationError('Les champs d\'identifiant et de mot de passe ne peuvent pas être vides.');
      return;
    }

    // Enregistrer les valeurs dans localStorage
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);

    login({ variables: { username, password } });
  };

  const formatErrorMessage = (error: ApolloError) => {
    const message = error.message.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    // Ajoutez le lien vers la page de mot de passe oublié uniquement si le message contient une erreur de mot de passe
    return message.includes("Mot de passe oublié ?")
      ? `${message}`
      : `${message} <a href="/forgot-password">Mot de passe oublié ?</a>`;
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
                placeholder=""
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Mot de passe</label>
              <input
                type="password"
                placeholder=""
                value={password || ''}
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
          {token && currentUser && (
            <div className="p-5">
              <h2 className="text-center text-lg font-semibold mb-5">Informations de l'utilisateur connecté</h2>
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Succès!</strong>
                <span className="block sm:inline">Connexion réussie.</span>
              </div>
              <p className="text-sm text-gray-700 mt-4">ID : {currentUser.id}</p>
              <p className="text-sm text-gray-700">Nom : {currentUser.name}</p>
              <p className="text-sm text-gray-700">Email : {currentUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
