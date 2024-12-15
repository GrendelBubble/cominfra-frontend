import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie'; // Importer js-cookie pour gérer les cookies
import client from '../lib/apollo-client';
import { gql } from '@apollo/client';

const VIEWER_QUERY = gql`
  query Viewer {
    viewer {
      id
      name
      email
    }
  }
`;

const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const backgroundImage = "/accueil.jpg"; // Nom de l'image de fond

  const checkLoginStatus = async () => {
    const token = Cookies.get('token');
    //console.log('Token:', token); // Débogage: affiche le token dans la console
    if (token) {
      try {
        const response = await client.query({
          query: VIEWER_QUERY,
          context: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        });
        const user = response.data.viewer;
        //console.log('User Data:', user); // Débogage: affiche les données utilisateur dans la console
        setCurrentUser(user);
        setIsLoggedIn(true); // Définit l'état de connexion à vrai
      } catch (err) {
        //console.error('Error fetching viewer data:', err);
        setIsLoggedIn(false); // Définit l'état de connexion à faux en cas d'erreur
      }
    } else {
      setIsLoggedIn(false); // Définit l'état de connexion à faux si pas de token
    }
  };

  useEffect(() => {
    checkLoginStatus();

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
      Cookies.remove('token');
      setIsLoggedIn(false);
      setCurrentUser(null);
      router.push('/login'); // Rediriger vers la page de login après déconnexion
    } else {
      router.push('/login');
    }
  };

  //console.log('Component render - isLoggedIn:', isLoggedIn); // Débogage: vérifier le rendu du composant et l'état

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
        {isLoggedIn && currentUser ? (
          <section className="bg-white shadow-md rounded-lg p-6 mb-4 w-full md:w-1/2 lg:w-1/3">
            <h2 className="text-2xl font-semibold mb-2">Bonjour, {currentUser.name}</h2>
            <p className="text-gray-700">Vous êtes connecté.</p>
          </section>
        ) : (
          <section className="bg-white shadow-md rounded-lg p-6 mb-4 w-full md:w-1/2 lg:w-1/3">
            <h2 className="text-2xl font-semibold mb-2">Bienvenue sur Notre Site</h2>
            <p className="text-gray-700">Veuillez vous connecter pour accéder à votre compte.</p>
          </section>
        )}
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
