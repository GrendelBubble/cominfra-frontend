import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import client from "../lib/apollo-client";
import { VIEWER_QUERY } from "../graphql/queries/viewer";
import { FaUserCircle, FaSignOutAlt, FaUserEdit } from 'react-icons/fa';

interface Category {
  name: string;
  slug: string;
  link: string | null;
  caption: string | null;
}

interface HeaderProps {
  categories: Category[];
  siteTitle: string;
  siteDescription: string;
  siteIconLink: string;
  isLoggedIn: boolean;
  currentUser: any;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;  // Ajouter setIsLoggedIn
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;  // Ajouter setCurrentUser
}

const Header: React.FC<HeaderProps> = ({
  categories,
  siteTitle,
  siteDescription,
  siteIconLink,
  isLoggedIn,
  currentUser,
  setIsLoggedIn,
  setCurrentUser
}) => {
  const [nav, setNav] = useState(false);
  const router = useRouter();
  const category = categories[0]; // On utilise simplement la première catégorie pour l'image de fond et la description.

  const checkLoginStatus = async () => {
    console.log("Checking login status...");
    const token = Cookies.get("token");
    if (token) {
      try {
        const response = await client.query({
          query: VIEWER_QUERY,
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
        setCurrentUser(response.data.viewer); // Met à jour l'utilisateur connecté
        setIsLoggedIn(true); // Met à jour l'état de connexion
        console.log("User is logged in:", response.data.viewer);
      } catch (err) {
        setIsLoggedIn(false); // Si erreur, considère l'utilisateur comme non connecté
        console.log("Error fetching user data:", err);
      }
    } else {
      setIsLoggedIn(false); // Si aucun token trouvé, déconnecte l'utilisateur
      console.log("No token found, user is not logged in.");
    }
  };

  const handleIconClick = () => {
    if (isLoggedIn) {
      Cookies.remove('token'); // Supprimer le token pour déconnecter l'utilisateur
      setIsLoggedIn(false); // Met à jour l'état de connexion
      setCurrentUser(null); // Réinitialise l'utilisateur connecté
      console.log("User logged out.");
    } else {
      router.push('/login'); // Redirige vers la page de login si l'utilisateur n'est pas connecté
    }
  };

  useEffect(() => {
    console.log("Component mounted, checking login status...");
    checkLoginStatus();

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setNav(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="header"
      style={{
        backgroundImage: category?.link ? `url(${category.link})` : 'none', // Optimisation de la gestion de l'image de fond
        backgroundSize: "auto 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left top",
        height: "var(--header-height)",
      }}
    >
      {siteIconLink ? (
        <img className="header-logo" src={siteIconLink} alt="Site Icon" />
      ) : (
        <div className="header-logo-placeholder">No Icon Available</div>
      )}

      <div className="header-content">
        <div className="header-site">{siteTitle}</div>
        <div className="header-slogan">{category?.caption || siteDescription}</div>
      </div>

      <nav className="absolute top-0 right-0 left-auto text-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-lg">
          <div
            className={`flex-col md:flex md:flex-row items-center w-[100px] md:w-auto md:order-2 transition-all duration-300 ${
              nav ? 'absolute top-3 right-16 w-[120px] shadow-md p-4 bg-gray-400' : 'hidden md:flex gap-6'
            }`}
          >
            <ul className="menu flex flex-col md:flex-row gap-4 md:gap-6">
              {categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <li key={index} className="menu-item">
                    <a href={`#${category.slug}`} className="text-lg">
                      {category.name}
                    </a>
                  </li>
                ))
              ) : (
                <li>Aucune catégorie disponible</li>
              )}
              <button className="header-icons">
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
  );
};

export default Header;
