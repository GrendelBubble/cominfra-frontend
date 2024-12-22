import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import client from '../lib/apollo-client';
import { VIEWER_QUERY } from '../graphql/queries/viewer';
import { SITE_INFO_QUERY } from '../graphql/queries/siteInfo';
import { LIST_CATEGORIES } from '../graphql/queries/categories';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [siteInfo, setSiteInfo] = useState({ title: '', description: '' });
  const [categories, setCategories] = useState<string[]>([]);
  const [nav, setNav] = useState(false);
  const router = useRouter();
  const backgroundImage = "/accueil.jpg";

  // Fonction qui gère le redimensionnement de la fenêtre
  const handleResize = () => {
    // Si la largeur de la fenêtre est plus grande que 768px (par exemple),
    // fermer le menu hamburger (si il est ouvert)
    if (window.innerWidth >= 768) {
      setNav(false);  // Fermer le menu
    }
  };

  useEffect(() => {
    // Ajouter un écouteur d'événement pour le redimensionnement
    window.addEventListener('resize', handleResize);

    // Nettoyer l'événement lorsqu'il n'est plus nécessaire
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
        setIsLoggedIn(true);
      } catch (err) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
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

  useEffect(() => {
    checkLoginStatus();
    fetchSiteInfo();
    fetchCategories();

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
    } else {
      router.push('/login');
    }
  };


  return (
<header className='header'
  style={{ 
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'auto 100%', 
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left top', 
    height: 'var(--header-height)' 
  }}
> 
  <div>
    <a href="#" className="flex items-center">
      <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
        <img src="/cominfra.png" alt="Cominfra Logo" className="header-logo" />
      </span>
    </a>
    <nav className="absolute top-0 right-0 left-auto text-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800"> 
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-lg">
        {/* Menu qui s'affiche en colonne sur mobile et en ligne sur desktop */}
        <div className={`flex-col md:flex md:flex-row items-center w-full md:w-auto md:order-2 transition-all duration-300 
          ${nav ? "absolute top-3 right-16 w-[100px] shadow-md p-4 bg-gray-400" : "hidden md:flex gap-6"}`}
        >
          <ul className="menu flex flex-col md:flex-row gap-4 md:gap-6">
            {categories.map((category, index) => (
              <li key={index} className="menu-item">
                <a href={`#${category.toLowerCase()}`} className="text-lg">{category}</a>
              </li>
            ))}
          </ul>
          <button onClick={handleIconClick} className="header-icons">
            {isLoggedIn ? (
              <FaSignOutAlt size={24} />
            ) : (
              <FaUserCircle size={24} />
            )}
          </button>
        </div>

        {/* Menu hamburger */}
        <div className="md:hidden flex items-center lg:order-1">
        <button
          type="button"
          className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="mobile-menu"
          aria-expanded={nav}  // Utiliser une valeur booléenne
          onClick={() => setNav(!nav)}
        >
            <span className="sr-only">Open main menu</span>
            {nav ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  </div>
</header>
  );
}

export default Home;
