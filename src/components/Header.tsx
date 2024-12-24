import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSignOutAlt, FaUserEdit } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { LIST_CATEGORIES } from '../graphql/queries/categories';
import client from '../lib/apollo-client';

interface HeaderProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, setIsLoggedIn, currentUser, setCurrentUser }) => {
  const [nav, setNav] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();
  const backgroundImage = "/accueil.jpg";

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
    fetchCategories();
  }, []);

  // Réinitialise le menu hamburger lorsque l'écran est plus large que 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setNav(false); // Ferme le menu si l'écran est plus large que 768px
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Appel initial pour vérifier la taille de l'écran au montage
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    <header
      className="header"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'auto 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left top',
        height: 'var(--header-height)',
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
            <div
              className={`flex-col md:flex md:flex-row items-center w-[100px] md:w-auto md:order-2 transition-all duration-300 ${
                nav
                  ? 'absolute top-3 right-16 w-[100px] shadow-md p-4 bg-gray-400'
                  : 'hidden md:flex gap-6'
              }`}
            >
              <ul className="menu flex flex-col md:flex-row gap-4 md:gap-6">
                {categories.map((category, index) => (
                  <li key={index} className="menu-item">
                    <a href={`#${category.toLowerCase()}`} className="text-lg">
                      {category}
                    </a>
                  </li>
                ))}
                <button onClick={handleIconClick} className="header-icons">
                  <FaUserEdit size={24} />
                </button>
                <button onClick={handleIconClick} className="header-icons">
                  {isLoggedIn ? <FaSignOutAlt size={24} /> : <FaUserCircle size={24} />}
                </button>
              </ul>
            </div>

            <div className="md:hidden flex items-center lg:order-1 bg-transparent">
              <button
                type="button"
                className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                aria-controls="mobile-menu"
                aria-expanded={nav}
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
};

export default Header;
