import React, { useState, useEffect } from "react";
import client from "../lib/apollo-client";
import { SITE_INFO_QUERY } from "../graphql/queries/siteInfo";
import { LIST_CATEGORIES } from "../graphql/queries/categories";
import { LIST_BACKGROUNDIMAGES } from "../graphql/queries/backgroundImages";
import Header from "../components/Header";
import jwtDecode from "jwt-decode";

// Fonction pour nettoyer le HTML et récupérer uniquement le texte brut
function cleanHtml(input: string | null): string {
  if (!input) return "";
  const doc = new DOMParser().parseFromString(input, "text/html");
  const textContent = doc.body.textContent || "";
  return textContent.replace(/\n/g, " ").trim();
}

// Fonction pour décoder le token JWT
function decodeJWT(token: string): any {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (err) {
    console.error("Erreur lors du décodage du token", err);
    return null;
  }
}

// Fonction d'entrée dans l'application
function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [siteInfo, setSiteInfo] = useState({ title: "", description: "", icon: "" });
  const [categoriesWithImages, setCategoriesWithImages] = useState<
    { name: string; slug: string; link: string | null; caption: string | null }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLoginStatus = () => {
    const token = document.cookie.split(";").find((cookie) => cookie.trim().startsWith("token="));
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = decodeJWT(token.split("=")[1]);
      setCurrentUser(decodedToken);
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
      setError("Une erreur s'est produite lors de la récupération des informations du site.");
    }
  };

  const fetchCategoriesWithImages = async () => {
    setLoading(true);
    try {
      const categoriesResponse = await client.query({
        query: LIST_CATEGORIES,
      });
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
              ? cleanHtml(matchingMedia.caption || siteInfo.description)
              : cleanHtml(siteInfo.description),
          };
        });

        setCategoriesWithImages(categoriesWithImages);
      }
    } catch (err) {
      setError("Une erreur s'est produite lors de la récupération des catégories.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const domain = process.env.NEXT_PUBLIC_ENDPOINT;
    document.cookie = `token=; Max-Age=0; path=/; domain=${domain}; Secure; SameSite=Strict`;
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    checkLoginStatus();
    fetchSiteInfo();
    fetchCategoriesWithImages();
  }, []);

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
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
          onLogout={handleLogout}
        />
      ) : (
        <div>Aucune catégorie disponible</div>
      )}
    </div>
  );
}

export default Home;
