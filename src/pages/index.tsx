import React, { useState, useEffect } from "react";
import client from "../lib/apollo-client";
import { SITE_INFO_QUERY } from "../graphql/queries/siteInfo";
import { LIST_CATEGORIES } from "../graphql/queries/categories";
import { LIST_BACKGROUNDIMAGES } from "../graphql/queries/backgroundImages";
import Header from "../components/Header";

// Fonction pour nettoyer le HTML et récupérer uniquement le texte brut
function cleanHtml(input: string | null): string {
  if (!input) return "";
  const doc = new DOMParser().parseFromString(input, "text/html");
  const textContent = doc.body.textContent || "";
  return textContent.replace(/\n/g, " ").trim(); // Remplacer les sauts de ligne par des espaces et supprimer les espaces inutiles
}

// Fonction d'entrée dans l'application
function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [siteInfo, setSiteInfo] = useState({ title: "", description: "", icon: "", });
  const [categoriesWithImages, setCategoriesWithImages] = useState<
    { name: string; slug: string; link: string | null; caption: string | null }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les informations du site
  const fetchSiteInfo = async () => {
    try {
      const response = await client.query({
        query: SITE_INFO_QUERY,
      });
  
      const { allSettings, siteIconLink } = response.data;
  
      setSiteInfo({
        title: allSettings.generalSettingsTitle,
        description: allSettings.generalSettingsDescription,
        icon: siteIconLink || "", // Utiliser siteIconLink ici
      });
    } catch (err) {
    }
  };

  // Récupérer les catégories et associer les images pour chaque catégorie
  const fetchCategoriesWithImages = async () => {
    setLoading(true);
    try {
      // Récupérer les catégories
      const categoriesResponse = await client.query({
        query: LIST_CATEGORIES,
      });
      const categories = categoriesResponse.data.categories.nodes;

      if (categories.length > 0) {
        // Extraire tous les names des catégories
        const categoryNames = categories.map((category: any) => category.name);

        // Extraire tous les slugs des catégories
        const categorySlugs = categories.map((category: any) => category.slug);

        // Récupérer toutes les images correspondantes aux slugs des catégories
        const mediaResponse = await client.query({
          query: LIST_BACKGROUNDIMAGES,
          variables: { slugs: categorySlugs },  // Passer les slugs des catégories comme variable
        });

        const mediaItems = mediaResponse.data.mediaItems.nodes;

        // Associer chaque catégorie à son image de fond correspondante
        const categoriesWithImages = categories.map((category: any) => {
          // Trouver l'image correspondant au slug de la catégorie
          const matchingMedia = mediaItems.find(
            (mediaItem: any) => mediaItem.slug === category.slug
          );

          return {
            name: category.name,
            slug: category.slug,
            link: matchingMedia ? matchingMedia.link : null,
            caption: matchingMedia
              ? cleanHtml(matchingMedia.caption || siteInfo.description)  // Nettoyer la légende
              : cleanHtml(siteInfo.description), // Utiliser la description du site si aucune image n'est trouvée
          };
        });

        setCategoriesWithImages(categoriesWithImages);
      }
    } catch (err) {
      setError("Une erreur s'est produite lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    fetchSiteInfo();
    fetchCategoriesWithImages();
  }, []); // Lancer l'effet au montage du composant

  // Vérifier si les données sont encore en train de se charger
  if (loading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {/* Afficher le Header uniquement lorsque les catégories sont chargées */}
      {categoriesWithImages.length > 0 ? (
        <Header
          categories={categoriesWithImages}
          siteTitle={siteInfo.title}
          siteDescription={siteInfo.description}
          siteIconLink={siteInfo.icon}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          setIsLoggedIn={setIsLoggedIn} // Ajout de setIsLoggedIn
          setCurrentUser={setCurrentUser} // Ajout de setCurrentUser
                />
      ) : (
        <div>Aucune catégorie disponible</div> // Message si aucune catégorie n'est trouvée
      )}
    </div>
  );
}

export default Home;
