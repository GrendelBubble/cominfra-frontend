// pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import client from '../lib/apollo-client';
import { VIEWER_QUERY } from '../graphql/queries/viewer';
import { SITE_INFO_QUERY } from '../graphql/queries/siteInfo';
import { LIST_POSTS } from '../graphql/queries/posts';
import Header from '../components/Header'; // Importer le composant Header
import PostList from '../components/PostList'; // Importer le composant PostList

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [siteInfo, setSiteInfo] = useState({ title: '', description: '' });
  const [posts, setPosts] = useState<any[]>([]);  // État pour stocker les posts
  const router = useRouter();

  // Fonction pour vérifier le statut de connexion
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

  // Fonction pour récupérer les informations du site
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

  // Fonction pour récupérer les posts
  const fetchPosts = async () => {
    try {
      const response = await client.query({
        query: LIST_POSTS,
      });
      setPosts(response.data.posts.nodes);  // Mettre à jour les posts
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    fetchSiteInfo();
    fetchPosts();  // Appel à la fonction pour récupérer les posts
  }, []);

  return (
    <div>
      <Header
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      {/* Corps de la page */}
      <main className="main">
        <div className="container mx-auto">
          {/* Passer les posts au composant PostList */}
          <PostList posts={posts} />
        </div>
      </main>
    </div>
  );
}

export default Home;
