// src/pages/login/logout.tsx

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

  return;
};

export default Logout;
