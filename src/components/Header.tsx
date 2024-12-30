import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import client from "../lib/apollo-client";
import { VIEWER_QUERY } from "../graphql/queries/viewer";
import { FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";

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
  currentUser: string;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  categories,
  siteTitle,
  siteDescription,
  siteIconLink,
  isLoggedIn,
  currentUser,
  setIsLoggedIn,
  setCurrentUser,
  onLogout,
}) => {
  const [nav, setNav] = useState(false); // Etat pour le menu mobile
  const [authError, setAuthError] = useState<string | null>(null); // Pour l'authentification
  const router = useRouter();

  const checkLoginStatus = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      return;
    }

    try {
      const response = await client.query({
        query: VIEWER_QUERY,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      setCurrentUser(response.data.viewer);
      setIsLoggedIn(true);
      setAuthError(null);
    } catch (err) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setAuthError("Impossible de vérifier l'authentification.");
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    setCurrentUser(null);
    onLogout();
    router.push("/"); // Redirection après déconnexion
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const toggleNav = () => setNav((prevNav) => !prevNav);

  useEffect(() => {
    checkLoginStatus();

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setNav(false); // Ferme le menu quand la largeur est supérieure à 768px
      }
    };

    window.addEventListener("resize", handleResize);
    if (window.innerWidth > 768) {
      setNav(false);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className="header bg-cover bg-no-repeat bg-left-top relative flex items-center justify-center header-padding"
      style={{
        backgroundImage: categories[0]?.link ? `url(${categories[0].link})` : "none",
        height: "var(--header-height)",
      }}
    >
      {/* Logo en haut à gauche */}
      <div className="absolute top-1 left-1">
        {siteIconLink ? (
          <img className="header-logo" src={siteIconLink} alt="Site Icon" />
        ) : (
          <div className="header-logo-placeholder">No Icon</div>
        )}
      </div>

      {/* Conteneur du titre et du slogan centré */}
      <div className="header-content text-center">
        <div className="header-site text-2xl text-white">{siteTitle}</div>
        <div className="header-slogan text-lg text-white">{categories[0]?.caption || siteDescription}</div>
      </div>

      {/* Menu de navigation en haut à droite */}
      <div className="absolute top-4 right-4 w-auto z-20">
        {/* Menu Hamburger pour mobile */}
        <div className="md:hidden">
          <button
            type="button"
            aria-expanded={nav ? "true" : "false"}
            onClick={toggleNav}
            className={`p-2 text-sm rounded-lg ${nav ? 'bg-gray-600/70' : 'bg-transparent'} hover:bg-gray-600/30 transition-colors duration-300`}
          >
            <FaBars size={24} />
          </button>
        </div>

        {/* Menu mobile déroulé (visible uniquement sur mobile) */}
        <div
          className={`md:hidden transition-all duration-300 ${nav ? "block bg-gray-600 mt-2 absolute top-full right-0 w-max" : "hidden"}`}
        >
          <ul className="flex flex-col gap-4 p-4">
            {categories.map((category, index) => (
              <li key={index}>
                <a
                  href={`#${category.slug}`}
                  className="text-lg text-white"
                >
                  {category.name}
                </a>
              </li>
            ))}
            <li>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="header-icons">
                  <FaSignOutAlt size={24} />
                </button>
              ) : (
                <button onClick={handleLoginRedirect} className="header-icons">
                  <FaUserCircle size={24} />
                </button>
              )}
            </li>
          </ul>
        </div>

        {/* Menu Desktop (visible uniquement sur les grands écrans) */}
        <nav className="hidden md:flex justify-center items-center gap-6 text-white">
          <ul className="flex gap-6">
            {categories.map((category, index) => (
              <li key={index}>
                <a
                  href={`#${category.slug}`}
                  className="text-lg hover:underline"
                >
                  {category.name}
                </a>
              </li>
            ))}
            <li>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="header-icons">
                  <FaSignOutAlt size={24} />
                </button>
              ) : (
                <button onClick={handleLoginRedirect} className="header-icons">
                  <FaUserCircle size={24} />
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Afficher l'erreur d'authentification */}
      {authError && (
        <div className="error-message bg-red-500 text-white p-2 text-center">
          {authError}
        </div>
      )}
    </header>
  );
};

export default Header;
