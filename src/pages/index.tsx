import React, { useState, useEffect } from "react";
import client from "../lib/apollo-client";
import { SITE_INFO_QUERY } from "../graphql/queries/siteInfo";
import { LIST_CATEGORIES } from "../graphql/queries/categories";
import { LIST_POSTS, INFO_POSTS } from "../graphql/queries/posts";
import { LIST_BACKGROUNDIMAGES } from "../graphql/queries/backgroundImages";
import { VIEWER_QUERY } from "../graphql/queries/viewer";
import Head from "next/head";
import { Header } from "../components/Header";
import { Body } from "../components/Body";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';  // Importer la locale française

function Home() {
  // States généraux
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteInfo, setSiteInfo] = useState({ title: "", description: "", icon: "" });
  const [categoriesWithImages, setCategoriesWithImages] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImageCaption, setBackgroundImageCaption] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsPerPage, setPostsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null); // Nouvel état pour le nombre total de pages

  // Fonction pour lire la valeur CSS --posts-per-page
  const getPostsPerPage = (): number => {
    const rootStyles = getComputedStyle(document.documentElement);
    const value = rootStyles.getPropertyValue("--posts-per-page").trim();
    return value ? parseInt(value, 10) : 12;
  };

  // Récupération des infos du site
  const fetchSiteInfo = async () => {
    try {
      const response = await client.query({ query: SITE_INFO_QUERY });
      const { allSettings, siteIconLink } = response.data;

      setSiteInfo({
        title: allSettings.generalSettingsTitle,
        description: allSettings.generalSettingsDescription,
        icon: siteIconLink || "",
      });
    } catch (err) {
      setError("Erreur lors de la récupération des informations du site.");
    }
  };

  // Vérification du statut de connexion
  const checkLoginStatus = async () => {
    const token = document.cookie.split(";").find((cookie) => cookie.trim().startsWith("token="));
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    try {
      const response = await client.query({
        query: VIEWER_QUERY,  // Query pour récupérer les infos de l'utilisateur
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      setIsLoggedIn(true);
      setCurrentUser(response.data.viewer);  // Utilisez la réponse pour mettre à jour currentUser
    } catch (err) {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // Récupération des catégories et images associées
  const fetchCategoriesWithImages = async () => {
    setLoading(true);
    try {
      const categoriesResponse = await client.query({ query: LIST_CATEGORIES });
      const categories = categoriesResponse.data.categories.nodes;

      if (categories.length > 0) {
        const categorySlugs = categories.map((category: any) => category.slug);
        const mediaResponse = await client.query({
          query: LIST_BACKGROUNDIMAGES,
          variables: { slugs: categorySlugs },
        });
        const mediaItems = mediaResponse.data.mediaItems.nodes;

        const categoriesWithImages = categories.map((category: any) => {
          const matchingMedia = mediaItems.find(
            (mediaItem: any) => mediaItem.slug === category.slug
          );
          return {
            name: category.name,
            slug: category.slug,
            link: matchingMedia ? matchingMedia.link : null,
            caption: matchingMedia
              ? matchingMedia.caption || siteInfo.description
              : siteInfo.description,
          };
        });

        setCategoriesWithImages(categoriesWithImages);

        const firstCategory = categoriesWithImages[0];
        if (firstCategory) {
          setActiveCategory(firstCategory.slug);
          setBackgroundImage(firstCategory.link);
          setBackgroundImageCaption(firstCategory.caption);
        }
      }
    } catch (err) {
      setError("Erreur lors de la récupération des catégories.");
    } finally {
      setLoading(false);
    }
  };

  // Récupération des informations de pagination (nombre de pages pour la catégorie)
  const fetchCategoryInfo = async (categoryName: string) => {
    try {
      const postsPerPage = getPostsPerPage();
      const response = await client.query({
        query: INFO_POSTS, // Requête INFO_POSTS pour obtenir le nombre de pages
        variables: {
          categoryName: categoryName,  // Utilisation du nom de la catégorie
          postPerPage: postsPerPage,
        },
      });

      const { postsPagesByCategoryName } = response.data.postsCategoryInfos;
      setTotalPages(postsPagesByCategoryName); // Stocke le nombre total de pages dans l'état
    } catch (err) {
      setError("Erreur lors de la récupération des informations de la catégorie.");
    }
  };

  // Récupération des posts d'une catégorie avec pagination
  const [pageInfo, setPageInfo] = useState({
    endCursor: null, // initialisation du curseur
    hasNextPage: false, // indicateur de la présence d'une page suivante
  });
  
  const fetchPostsForCategory = async (categorySlug: string, page: number) => {
    setLoading(true);
    try {
      const after = page > 1 && pageInfo.endCursor ? pageInfo.endCursor : null;
        const response = await client.query({
        query: LIST_POSTS,
        variables: {
          categoryName: categorySlug,
          first: postsPerPage,
          after: after, // Passer le curseur pour récupérer les articles suivants
        },
      });
  
      const fetchedPosts = response.data.posts.nodes;
      const newPageInfo = response.data.posts.pageInfo;

      // Formater les dates `date` et `modified` avec date-fns
      const formattedPosts = fetchedPosts.map((post: any) => {
        return {
          ...post,
          date: format(new Date(post.date), "dd MMMM yyyy", { locale: fr }), // Format de la date de publication
          modified: format(new Date(post.modified), "dd MMMM yyyy", { locale: fr }), // Format de la date de modification
        };
      });

      // Remplacer les posts précédents par ceux de la page actuelle
      //setPosts(fetchedPosts);
      setPosts(formattedPosts);    
  
      // Mettre à jour pageInfo après l'appel API
      setPageInfo(newPageInfo);
  
    } catch (err) {
      console.error("Erreur lors de la récupération des posts:", err);
      setError("Erreur lors de la récupération des posts.");
    } finally {
      setLoading(false);
    }
  };
        
  // Gestion de la catégorie active
  const handleCategoryClick = (slug: string, name: string) => {
    setActiveCategory(slug);
    setCurrentPage(1); // Réinitialise la pagination à la première page
    fetchCategoryInfo(name); // Récupère les informations de pagination à chaque changement de catégorie

    // Met à jour l'image de fond et la légende correspondantes
    const selectedCategory = categoriesWithImages.find((category) => category.slug === slug);
    if (selectedCategory) {
      setBackgroundImage(selectedCategory.link); // Met à jour l'image de fond
      setBackgroundImageCaption(selectedCategory.caption); // Met à jour la légende
    }

  };

  // Fonction de gestion de la page
  const handlePageChange = (after: string | null, resetPosts: boolean = false) => {
    if (resetPosts) {
      // Si `resetPosts` est activé, on réinitialise les posts (par exemple, lors du changement de catégorie ou de retour à la première page)
      setPosts([]);  // Effacer les posts précédents
      setCurrentPage(1);  // Réinitialiser à la première page
    } else {
      // Si `after` est défini, on passe à la page suivante
      setCurrentPage((prevPage) => prevPage + 1);  // Passer à la page suivante
    }
  };
    
  // Chargement initial
  useEffect(() => {
    setPostsPerPage(getPostsPerPage());
    fetchSiteInfo();
    fetchCategoriesWithImages();
  }, []);

  // Mise à jour des posts lorsque la catégorie active ou la page change
  useEffect(() => {
    if (activeCategory && currentPage) {
      fetchPostsForCategory(activeCategory, currentPage);
    }
  }, [activeCategory, currentPage]); // Ne pas inclure pageInfo dans les dépendances ici
    
  if (loading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Head>
        <title>{siteInfo.title}</title>
        {siteInfo.icon && <link rel="icon" href={siteInfo.icon} />}
      </Head>
      {categoriesWithImages.length > 0 ? (
        <Header
          categories={categoriesWithImages}
          siteTitle={siteInfo.title}
          siteDescription={siteInfo.description}
          siteIconLink={siteInfo.icon}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setCurrentUser={setCurrentUser}
          onLogout={() => setIsLoggedIn(false)}
          onCategoryClick={handleCategoryClick}
          backgroundImage={backgroundImage}
          backgroundImageCaption={backgroundImageCaption}
        />
      ) : (
        <div>Aucune catégorie disponible</div>
      )}
      <Body
        activeCategory={activeCategory}
        posts={posts}
        postsPerPage={postsPerPage}
        currentPage={currentPage}
        pageInfo={pageInfo}  // Passez les informations de pagination
        totalPages={totalPages} // Passez le nombre total de pages à Body
        onPageChange={handlePageChange} // Gérer le changement de page
      />
      <footer className="footer bg-gray-800 text-white text-center p-4">
        <p>© 2024 {siteInfo.title}. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default Home;
