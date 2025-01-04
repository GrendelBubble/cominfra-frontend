// src/pages/forgot-password.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/router';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Simuler l'envoi de l'email de réinitialisation de mot de passe
    setSubmitted(true);

    // Rediriger vers la page de connexion après 3 secondes
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        {/* Icône de retour à la page de login */}
        <div className="absolute top-5 left-5 z-50">
        <button
          onClick={() => router.push('/login')} // Redirection vers la page d'accueil
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          {/* Icône de retour en SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-6 w-6 text-gray-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 12H5M12 5l-7 7 7 7"
            />
          </svg>
        </button>
      </div>

        <h1 className="font-bold text-center text-2xl mb-5">Mot de Passe Oublié</h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200 p-5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-4">
                <label className="font-semibold text-sm text-gray-600 pb-1 block">Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded-lg px-3 py-2 mt-1 text-sm w-full"
                  required
                />
              </div>
              <button
                type="submit"
                className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                Réinitialiser le mot de passe
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-700 mt-4">Un email de réinitialisation a été envoyé à {email}. Consultez votre messagerie. Vous serez redirigé vers la page de connexion sous peu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
