import React, { useState, useEffect } from "react";
import client from "../lib/apollo-client";
import { SITE_INFO_QUERY } from "../graphql/queries/siteInfo";
import { LIST_CATEGORIES } from "../graphql/queries/categories";
import { LIST_POSTS } from "../graphql/queries/posts";
import { LIST_BACKGROUNDIMAGES } from "../graphql/queries/backgroundImages"; // Importez la query
import Head from "next/head";  // Importation de Head
import { Header } from "../components/Header";
import { Body } from "../components/Body";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [siteInfo, setSiteInfo] = useState({ title: "", description: "", icon: "" });
  const [categoriesWithImages, setCategoriesWithImages] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null); // Image de fond

  // Fonction pour récupérer les images de fond
  const fetchCategoriesWithImages = async () => {
    setLoading(true);
    try {
      const categoriesResponse = await client.query({
        query: LIST_CATEGORIES,
      });
      const categories = categoriesResponse.data.categories.nodes;

      // Si vous avez des catégories, récupérer les images associées
      if (categories.length > 0) {
        const categorySlugs = categories.map((category: any) => category.slug);

        // Récupérer les images de fond associées aux catégories
        const mediaResponse = await client.query({
          query: LIST_BACKGROUNDIMAGES,
          variables: { slugs: categorySlugs },
        });

        const mediaItems = mediaResponse.data.mediaItems.nodes;

        // Associer chaque catégorie avec une image (si elle existe)
        const categoriesWithImages = categories.map((category: any) => {
          const matchingMedia = mediaItems.find(
            (mediaItem: any) => mediaItem.slug === category.slug
          );

          return {
            name: category.name,
            slug: category.slug,
            link: matchingMedia ? matchingMedia.link : null, // Si une image est trouvée
            caption: matchingMedia
              ? matchingMedia.caption || siteInfo.description
              : siteInfo.description,
          };
        });

        setCategoriesWithImages(categoriesWithImages);

        // Définir la première catégorie et la première image de fond par défaut
        const firstCategory = categoriesWithImages[0];
        if (firstCategory) {
          setActiveCategory(firstCategory.slug);
          setBackgroundImage(firstCategory.link);
        }
      }
    } catch (err) {
      setError("Erreur lors de la récupération des catégories et des images.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour vérifier l'état de connexion
  const checkLoginStatus = () => {
    const token = document.cookie.split(";").find((cookie) => cookie.trim().startsWith("token="));
    if (token) {
      setIsLoggedIn(true);
    }
  };

  const fetchSiteInfo = async () => {
    try {
      const response = await client.query({
        query: SITE_INFO_QUERY,
      });

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

  const fetchPostsForCategory = async (categorySlug: string) => {
    setLoading(true);
    try {
      const response = await client.query({
        query: LIST_POSTS,
        variables: { categoryName: categorySlug, qtyReturned: 5 },
      });
      setPosts(response.data.posts.nodes);
    } catch (err) {
      setError("Erreur lors de la récupération des posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (slug: string) => {
    setActiveCategory(slug);
    fetchPostsForCategory(slug);
  };

  // useEffect déclenché uniquement lorsque la catégorie active change
  useEffect(() => {
    if (activeCategory) {
      fetchPostsForCategory(activeCategory); // Récupérer les posts pour la catégorie sélectionnée

      // Trouver l'image correspondante à la catégorie active
      const activeCategoryImage = categoriesWithImages.find(
        (category) => category.slug === activeCategory
      );

      // Si une image est trouvée, mettre à jour l'état de l'image de fond
      if (activeCategoryImage && activeCategoryImage.link) {
        setBackgroundImage(activeCategoryImage.link);
        console.log("Nouvelle image de fond :", activeCategoryImage.link); // Juste pour vérifier dans la console
      }
    }
  }, [activeCategory, categoriesWithImages]); // Ajoutez `categoriesWithImages` dans la dépendance

  // useEffect pour initialiser les données au premier chargement de la page
  useEffect(() => {
    checkLoginStatus();
    fetchSiteInfo();
    fetchCategoriesWithImages(); // Appelez cette fonction pour récupérer les catégories et les images
  }, []); // Effect au premier rendu (équivalent de componentDidMount)

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Head>
        <title>{siteInfo.title || "Mon Site"}</title>
        {siteInfo.icon && <link rel="icon" href={siteInfo.icon} />}
      </Head>
      {categoriesWithImages.length > 0 ? (
        <Header
          categories={categoriesWithImages}
          siteTitle={siteInfo.title}
          siteDescription={siteInfo.description}
          siteIconLink={siteInfo.icon}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          setIsLoggedIn={setIsLoggedIn}
          setCurrentUser={setCurrentUser}
          onLogout={() => setIsLoggedIn(false)}
          onCategoryClick={handleCategoryClick}
          backgroundImage={backgroundImage} // Passez l'image de fond ici
        />
      ) : (
        <div>Aucune catégorie disponible</div>
      )}
      <Body
        activeCategory={activeCategory}
        posts={posts}
      />
    </div>
  );
}

export default Home;
