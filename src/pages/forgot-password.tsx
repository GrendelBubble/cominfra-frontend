// src/pages/forgot-password.tsx

import React from 'react';

const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-2xl mb-5">Mot de Passe Oublié</h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200 p-5">
          <p className="text-sm text-gray-700 mt-4">
            Veuillez entrer votre adresse e-mail pour réinitialiser votre mot de passe.
          </p>
          <form className="mt-4">
            <div className="mb-4">
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Adresse e-mail</label>
              <input
                type="email"
                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full"
              />
            </div>
            <button
              type="submit"
              className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
            >
              Réinitialiser le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
