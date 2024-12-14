// src/pages/_error.tsx

import { NextPageContext } from 'next';
import React from 'react';

interface ErrorProps {
  statusCode: number;
  message: string;
}

const Error = ({ statusCode, message }: ErrorProps) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-2xl mb-5">Une Erreur s'est Produite</h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200 p-5">
          <p className="text-sm text-gray-700 mt-4">
            {statusCode ? `Une erreur ${statusCode} est survenue sur le serveur` : 'Une erreur est survenue sur le client'}
          </p>
          <p className="text-sm text-gray-700 mt-4">{message}</p>
        </div>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  const message = err?.message || 'Une erreur inattendue s\'est produite';
  return { statusCode, message };
};

export default Error;
