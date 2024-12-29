import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import client from "../lib/apollo-client";
import { VIEWER_QUERY } from "../graphql/queries/viewer";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

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
  onLogout: () => void; // Ajout du paramètre onLogout
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
  const [nav, setNav] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null); // Pour suivre les erreurs d'authentification
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
      setAuthError(null); // Aucune erreur
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
    onLogout(); // Appel de la fonction onLogout passée en paramètre
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
        setNav(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="header bg-cover bg-no-repeat bg-left-top"
      style={{
        backgroundImage: categories[0]?.link ? `url(${categories[0].link})` : "none",
        height: "var(--header-height)",
      }}
    >
      <div className="header-content-container">
        {siteIconLink ? (
          <img className="header-logo" src={siteIconLink} alt="Site Icon" />
        ) : (
          <div className="header-logo-placeholder">No Icon</div>
        )}

        <div className="header-content">
          <div className="header-site">{siteTitle}</div>
          <div className="header-slogan">
            {categories[0]?.caption || siteDescription}
          </div>
        </div>
      </div>

      <nav className="absolute top-0 right-0 px-4 lg:px-6 py-2.5 text-white bg-gray-800">
        <div className="flex justify-between items-center max-w-screen-lg mx-auto">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <button
              type="button"
              aria-expanded={nav}
              className="p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400"
              onClick={toggleNav}
            >
              {nav ? (
                <FaSignOutAlt size={24} />
              ) : (
                <FaUserCircle size={24} />
              )}
            </button>
          </div>

          {/* Desktop Menu */}
          <ul
            className={`menu flex-col md:flex md:flex-row gap-4 md:gap-6 ${
              nav ? "block" : "hidden md:flex"
            }`}
          >
            {categories.map((category, index) => (
              <li key={index} className="menu-item">
                <a
                  href={`#${category.slug}`}
                  className="text-lg text-white hover:underline"
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
      </nav>

      {/* Affichage d'une éventuelle erreur */}
      {authError && (
        <div className="error-message bg-red-500 text-white p-2 text-center">
          {authError}
        </div>
      )}
    </div>
  );
};

export default Header;
