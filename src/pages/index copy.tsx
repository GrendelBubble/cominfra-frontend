import React, { useEffect, useState, useRef } from 'react';
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
  const [fontSize, setFontSize] = useState<number>(16); // Taille de police initiale
  const menuRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const backgroundImage = "/accueil.jpg";

  const checkLoginStatus = async () => {
    const token = Cookies.get('token');
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

  const adjustFontSize = () => {
    const menuElement = menuRef.current;
    if (!menuElement) return;

    const parentWidth = menuElement.parentElement?.offsetWidth || 0;
    const menuWidth = menuElement.scrollWidth;

    console.log('Parent Width:', parentWidth, 'Menu Width:', menuWidth); // Debug

    if (menuWidth > parentWidth) {
      setFontSize((prevFontSize) => Math.max(prevFontSize - 1, 12)); // Réduire la taille de la police, minimum 12px
    }
  };

  useEffect(() => {
    checkLoginStatus();
    fetchSiteInfo();
    fetchCategories();

    const handleResize = () => {
      adjustFontSize();
    };

    window.addEventListener('resize', handleResize);
    adjustFontSize(); // Appeler au montage pour vérifier si une réduction initiale est nécessaire

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [categories]);

  const handleIconClick = () => {
    if (isLoggedIn) {
      Cookies.remove('token');
      setIsLoggedIn(false);
      setCurrentUser(null);
      router.push('/');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="wrapper">
      <Head>
        <title>Com'In</title>
      </Head>
      <header
        className="header home-header"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left top',
          height: 'var(--header-height)',
        }}
      >
        <div className="header-top">
          <img src="/cominfra.png" alt="Cominfra Logo" className="header-logo" />
          <nav className="main-nav">
            <ul
              ref={menuRef}
              className="menu"
              style={{ fontSize: `${fontSize}px` }} // Application de la taille de police dynamique
            >
              {categories.map((category, index) => (
                <li key={index} className="menu-item">
                  <a href={`#${category.toLowerCase()}`}>{category}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-icons">
            <button
              onClick={handleIconClick}
              className="text-white hover:text-gray-300 flex items-center"
            >
              {isLoggedIn ? (
                <FaSignOutAlt size={24} />
              ) : (
                <FaUserCircle size={24} />
              )}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Home;
