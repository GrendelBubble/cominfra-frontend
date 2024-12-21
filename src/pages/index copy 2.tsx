import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
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

const SITE_INFO_QUERY = gql`
  query MyQuery {
    allSettings {
      generalSettingsTitle
      generalSettingsDescription
    }
  }
`;

const LIST_CATEGORIES = gql`
  query GetFilteredCategories {
    categories(
      where: { parent: null, exclude: "1", orderby: DESCRIPTION, order: ASC }
    ) {
      nodes {
        name
      }
    }
  }
`;

const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [siteInfo, setSiteInfo] = useState({ title: '', description: '' });
  const [categories, setCategories] = useState<string[]>([]);
  const [headerWidth, setHeaderWidth] = useState<number>(0);
  const router = useRouter();
  const backgroundImage = "/accueil.jpg"; // Nom de l'image de fond

  const checkLoginStatus = async () => {
    const token = Cookies.get('token');
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
        setCurrentUser(user);
        setIsLoggedIn(true); // Définit l'état de connexion à vrai
      } catch (err) {
        setIsLoggedIn(false); // Définit l'état de connexion à faux en cas d'erreur
      }
    } else {
      setIsLoggedIn(false); // Définit l'état de connexion à faux si pas de token
    }
  };

  const fetchSiteInfo = async () => {
    try {
      const response = await client.query({
        query: SITE_INFO_QUERY,
      });
      const { generalSettingsTitle, generalSettingsDescription } = response.data.allSettings;
      setSiteInfo({ title: generalSettingsTitle, description: generalSettingsDescription });
    } catch (err) {
      console.error('Error fetching site info:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await client.query({
        query: LIST_CATEGORIES,
      });
      const categoryNames = response.data.categories.nodes.map((category: { name: string }) => category.name);
      setCategories(categoryNames);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const calculateHeaderWidth = () => {
    // On récupère tous les éléments du header
    const headerElements = document.querySelectorAll('.header-top > *');
    const totalWidth = Array.from(headerElements).reduce((width, element) => {
      return width + (element as HTMLElement).offsetWidth;
    }, 0);

    // On récupère la largeur des icônes du logo et des boutons
    const cominfraIconWidth = (document.querySelector('.header-logo') as HTMLElement)?.offsetWidth || 0;
    const loginIconWidth = (document.querySelector('.header-icons button') as HTMLElement)?.offsetWidth || 0;

    // On prend en compte les catégories du menu
    const menuItemsCount = categories.length;
    const maxMenuItemWidth = 300; // Largeur maximale d'un élément de menu
    const margin = 200; // Marge raisonnable (20px de chaque côté)

    // On calcule la largeur totale
    const calculatedWidth = totalWidth + cominfraIconWidth + loginIconWidth + (menuItemsCount * maxMenuItemWidth) + margin;

    setHeaderWidth(calculatedWidth);
  };

  useEffect(() => {
    checkLoginStatus();
    fetchSiteInfo();
    fetchCategories(); // Récupérer les catégories avant le calcul

    const handleRouteChange = () => {
      checkLoginStatus();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, categories]);

  useEffect(() => {
    // Effectuer le calcul de la largeur une fois que les catégories sont récupérées
    if (categories.length > 0) {
      calculateHeaderWidth();
    }
  }, [categories]);

  const handleIconClick = () => {
    if (isLoggedIn) {
      Cookies.remove('token');
      setIsLoggedIn(false);
      setCurrentUser(null);
      router.push('/'); // Rediriger vers la page de login après déconnexion
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="wrapper" style={{ minWidth: `${headerWidth}px` }}>
      <Head>
        <title>Com'In</title> {/* Ajout de la balise de titre */}
      </Head>
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
        <div className="header-top">
          <img src="/cominfra.png" alt="Cominfra Logo" className="header-logo" />
          <nav className="main-nav">
            <ul className="menu">
              {categories.map((category, index) => (
                <li key={index} className="menu-item">
                  <a href={`#${category.toLowerCase()}`}>{category}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-icons">
            <button onClick={handleIconClick} className="text-white hover:text-gray-300 flex items-center">
              {isLoggedIn ? (
                <FaSignOutAlt size={24} />
              ) : (
                <FaUserCircle size={24} />
              )}
            </button>
          </div>
        </div>
              <div className="header-width-info">
        Largeur totale des éléments du header-top (y compris les marges et icônes) : {headerWidth}px
      </div>

        {/*
        <div className="header-content">
          <h1 className="header-title text-2xl font-bold">{siteInfo.title}</h1>
          <p className="header-slogan">{siteInfo.description}</p>
        </div> 
        */} 
      </header>
      <main className="main">
      {/*
        {categories.map((category, index) => (
          <section key={index} id={category.toLowerCase()} className="bg-white shadow-md rounded-lg p-6 mb-4 w-full md:w-1/2 lg:w-1/3">
            <h2 className="text-2xl font-semibold mb-2">{category}</h2>
            <p className="text-gray-700">Contenu pour {category}</p>
          </section>
        ))}
      */}
      </main>
      <footer className="footer">
       {/* 
        <p>&copy; 2024 Votre Compagnie. Tous droits réservés.</p>
        */} 
      </footer>
    </div>
  );
};

export default Home;
