// src/pages/logout.tsx

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const Logout: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Supprimer le token d'authentification (par exemple, du localStorage)
    localStorage.removeItem('token');

    // Rediriger vers la page de connexion
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-2xl mb-5">Déconnexion</h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200 p-5">
          <p className="text-sm text-gray-700 mt-4">Vous êtes en cours de déconnexion...</p>
        </div>
      </div>
    </div>
  );
};

export default Logout;
