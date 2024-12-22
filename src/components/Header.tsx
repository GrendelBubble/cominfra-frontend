// src/components/Header.tsx
import React from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';

// Définir l'interface des props attendues par le composant Header
interface HeaderProps {
  categories: string[]; // Tableau de chaînes de caractères pour les catégories
  isLoggedIn: boolean; // Statut de la connexion de l'utilisateur
  onIconClick: () => void; // Fonction appelée au clic sur l'icône de connexion/déconnexion
  nav: boolean; // Indicateur de l'état du menu
  setNav: (nav: boolean) => void; // Fonction pour modifier l'état du menu
}

const Header: React.FC<HeaderProps> = ({ categories, isLoggedIn, onIconClick, nav, setNav }) => {
  const router = useRouter();
  const backgroundImage = "/accueil.jpg"; // Nom de l'image de fond

  return (
    <header
      className='header'
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
            {/* Menu qui s'affiche en colonne sur mobile et en ligne sur desktop */}
            <div className={`flex-col md:flex md:flex-row items-center w-full md:w-auto md:order-2 transition-all duration-300 ${nav ? "absolute top-14 left-0 w-full shadow-md p-4 bg-gray-800" : "hidden md:flex gap-6"}`}>
              <ul className="menu flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Typage explicite pour 'category' et 'index' */}
                {categories.map((category: string, index: number) => (
                  <li key={index} className="menu-item">
                    <a href={`#${category.toLowerCase()}`} className="text-lg">{category}</a>
                  </li>
                ))}
              </ul>
              <button onClick={onIconClick} className="header-icons">
                {isLoggedIn ? <FaSignOutAlt size={24} /> : <FaUserCircle size={24} />}
              </button>
            </div>
            {/* Menu hamburger */}
            <div className="md:hidden flex items-center lg:order-1">
              <button
                type="button"
                className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                aria-controls="mobile-menu"
                aria-expanded={nav}  /* Correction: Utiliser un boolean directement */
                onClick={() => setNav(!nav)}
              >
                <span className="sr-only">Open main menu</span>
                {nav ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
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
