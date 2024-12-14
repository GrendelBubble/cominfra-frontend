import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';

const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false); // État pour forcer la mise à jour
  const router = useRouter();
  const backgroundImage = "/accueil.jpg"; // Nom de l'image de fond

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setRefresh((prev) => !prev); // Forcer le rafraîchissement visuel
    console.log('Token:', token); // Débogage: affiche le token dans la console
    console.log('IsLoggedIn:', !!token); // Débogage: affiche l'état de connexion dans la console
  };

  useEffect(() => {
    // Vérifie l'état de connexion lors du chargement de la page
    checkLoginStatus();

    // Vérifie l'état de connexion à chaque changement de route
    const handleRouteChange = () => {
      checkLoginStatus();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const handleIconClick = () => {
    if (isLoggedIn) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      router.push('/logout');
    } else {
      router.push('/login');
    }
    setRefresh((prev) => !prev); // Forcer la mise à jour
  };

  console.log('Component render - isLoggedIn:', isLoggedIn); // Débogage: vérifier le rendu du composant et l'état

  return (
    <div className="wrapper">
      <header 
        className="header home-header"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'auto 100%', // S'assurer que l'image occupe toute la hauteur du header
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left top', // Aligner l'image à gauche et en haut
          height: 'var(--header-height)' // Utilisation de la variable pour la hauteur du header
        }}
      >
        <h1 className="header-title text-3xl font-bold">Bienvenue sur Notre Site</h1>
        <div className="header-icons">
          <button onClick={handleIconClick} className="text-white hover:text-gray-300 flex items-center">
            {isLoggedIn ? (
              <FaSignOutAlt size={24} />
            ) : (
              <FaUserCircle size={24} />
            )}
          </button>
        </div>
      </header>
      <main className="main">
        <section className="bg-white shadow-md rounded-lg p-6 mb-4 w-full md:w-1/2 lg:w-1/3">
          <h2 className="text-2xl font-semibold mb-2">Nos Services</h2>
          <p className="text-gray-700">Découvrez nos services exceptionnels et comment ils peuvent vous aider à atteindre vos objectifs.</p>
        </section>
        <section className="bg-white shadow-md rounded-lg p-6 mb-4 w-full md:w-1/2 lg:w-1/3">
          <h2 className="text-2xl font-semibold mb-2">Contactez-Nous</h2>
          <p className="text-gray-700">Vous avez des questions ou besoin de plus d'informations ? N'hésitez pas à nous contacter !</p>
        </section>
      </main>
      <footer className="footer">
        <p>&copy; 2024 Votre Compagnie. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Home;
