import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import client from "../lib/apollo-client";
import { VIEWER_QUERY } from "../graphql/queries/viewer";
import { FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";


interface HeaderProps {
  categories: any[];
  siteTitle: string;
  siteDescription: string;
  siteIconLink: string;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
  onCategoryClick: (id: string, name: string, slug: string) => void;  // Attendez deux arguments
  backgroundImage: string | null;
  backgroundImageCaption: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  siteTitle,
  siteDescription,
  siteIconLink,
  isLoggedIn,
  setIsLoggedIn,
  onLogout,
  onCategoryClick,
  backgroundImage,
  backgroundImageCaption,
}) => {
  const stripHtmlTags = (htmlString: string): string => {
    return htmlString.replace(/<[^>]*>/g, "");
  };
  const headerCaption = backgroundImageCaption ? stripHtmlTags(backgroundImageCaption) : null;


  const [nav, setNav] = useState(false); // Etat pour le menu mobile
  const [authError, setAuthError] = useState<string | null>(null); // Pour l'authentification
  const router = useRouter();

  const checkLoginStatus = async () => {
    const token = Cookies.get("token");
  
    if (!token) {
      // Si le token est introuvable, déconnecter l'utilisateur et effacer ses données
      setIsLoggedIn(false);
      return;
    }
  
    try {
      // Ici, vous pouvez effectuer une requête pour vérifier si le token est valide et obtenir les données de l'utilisateur
      const response = await client.query({
        query: VIEWER_QUERY,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
  
      // Si la réponse est valide, mettre à jour les données de l'utilisateur
      setIsLoggedIn(true);
    } catch (err) {
      setIsLoggedIn(false);
      setAuthError("Impossible de vérifier l'authentification.");
    }
  };
  
  const handleLogout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
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

  const [isMenuOpen, setIsMenuOpen] = useState(false); // État pour gérer l'ouverture du menu

  return (
    <header
      className="header"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundPosition: "top right", // Positionner en haut à droite
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

      {/* Contenu centré pour les titres */}
      <div className="header-content">
        <div className="header-site">{siteTitle}</div>
        <div className="header-caption">{headerCaption}</div>
      </div>

      {/* Conteneur pour les menus (aligné en haut à droite) */}
      <div className="menu">
        {/* Menu Hamburger pour les petits écrans */}
        <button
          className="hamburger-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)} // Inverser l'état du menu
        >
          {isMenuOpen ? "X" : "☰"} {/* Affiche un "X" ou un hamburger en fonction de l'état */}
        </button>
        {/* Menu Mobile (visible seulement si isMenuOpen est true) */}
        {isMenuOpen && (
          <nav className="mobile-menu">
            <ul className="flex flex-col gap-6">
              {categories.map((category) => (
                <li key={category.slug}>
                  <button
                    onClick={() => {
                      onCategoryClick(category.id,category.name,category.slug);
                      setIsMenuOpen(false); // Ferme le menu après avoir sélectionné une catégorie
                    }}
                    className="text-lg hover:underline"
                  >
                    {category.name}
                  </button>
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
        )}        
        {/* Menu Desktop (visible sur les grands écrans) */}
        <nav className="desktop-menu">
          <ul className="flex gap-6">
            {categories.map((category) => (
              <li key={category.slug}>
                <button
                  onClick={() => onCategoryClick(category.id,category.name,category.slug)}
                  className="text-lg hover:underline"
                >
                  {category.name}
                </button>
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
    </header>
  );
};
