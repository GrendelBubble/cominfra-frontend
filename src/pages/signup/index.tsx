import React, { useState, FormEvent } from 'react';
import { gql, useMutation, ApolloError } from '@apollo/client';
import { useRouter } from 'next/router';
import client from '../../lib/apollo-client';
import ErrorMessage from '../../components/ErrorMessage';
import Cookies from 'js-cookie';

const REGISTER_USER_MUTATION = gql`
  mutation RegisterUser($username: String!, $email: String!, $password: String!) {
    registerUser(input: {username: $username, email: $email, password: $password}) {
      clientMutationId
    }
  }
`;

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apolloError, setApolloError] = useState<string | null>(null);
  const router = useRouter();

  const [registerUser, { loading }] = useMutation(REGISTER_USER_MUTATION, {
    client: client,
    onCompleted: (data) => {
      const authToken = data.registerUser.authToken;
      console.log('Auth Token:', authToken); // Log the token
      Cookies.set('token', authToken, { expires: 1 }); // Store the token in cookies

      // Redirect to the homepage after sign-up
      router.push('/');
    },
    onError: (error) => {
      setValidationError(null); // Reset validation error
      console.error('Apollo Error:', error); // Log the Apollo error
      setApolloError(formatErrorMessage(error));
    }
  });

  const handleSignUp = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null); // Reset validation error
    setApolloError(null); // Reset Apollo error

    // Check if fields are empty
    if (!username || !email || !password) {
      setValidationError('Tous les champs sont requis.');
      return;
    }

    console.log('Signing up with:', username, email, password); // Log the information
    registerUser({ variables: { username, email, password } }).catch((err) => {
      console.error('Signup Error:', err);
      setApolloError(err.message);
    });
  };

  const formatErrorMessage = (error: ApolloError) => {
    const message = error.message.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    return `${message}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-2xl mb-5">Inscription</h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
          <form onSubmit={handleSignUp} className="px-5 py-7">
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
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Email</label>
              <input
                type="email"
                placeholder=""
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
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
              <span className="inline-block mr-2">S'inscrire</span>
            </button>
            {validationError && <ErrorMessage message={validationError} />}
            {apolloError && <ErrorMessage message={apolloError} />}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
