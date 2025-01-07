import React, { useState, useEffect } from "react";
import client from "../lib/apollo-client";
import { SITE_INFO_QUERY } from "../graphql/queries/siteInfo";
import { LIST_CATEGORIES } from "../graphql/queries/categories";
import { LIST_POSTS, INFO_POSTS } from "../graphql/queries/posts";
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
  const [categories, setCategories] = useState<any[]>([]);  // Catégories sans les images
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImageCaption, setBackgroundImageCaption] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsPerPage, setPostsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [totalPages, setTotalPages] = useState<number | null>(null); // Nouvel état pour le nombre total de pages
  const [loadingPagination, setLoadingPagination] = useState(false); // Nouvel état pour gérer le chargement de la pagination

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

  // Récupération des catégories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesResponse = await client.query({ query: LIST_CATEGORIES });

      if (!categoriesResponse || !categoriesResponse.data || !categoriesResponse.data.categories || !categoriesResponse.data.categories.edges) {
        setError("Données des catégories manquantes ou mal structurées.");
        return;
      }

      const categories = categoriesResponse.data.categories.edges;

      if (!Array.isArray(categories)) {
        setError("Les catégories ne sont pas sous forme de tableau.");
        return;
      }

      // Filtrer les catégories pour garder uniquement celles avec isMenu = true et enableMenu = true
      const filteredCategories = categories.filter((categoryEdge: any) => 
        categoryEdge.node.acfCustomFields?.isMenu === true && categoryEdge.node.acfCustomFields?.enableMenu === true
      );

      if (filteredCategories.length > 0) {
        const categoriesList = filteredCategories.map((categoryEdge: any) => ({
          name: categoryEdge.node.name,
          slug: categoryEdge.node.slug,
          mediaItemUrl: categoryEdge.node.acfCustomFields?.backgroundImage?.node?.mediaItemUrl || null,
          caption: categoryEdge.node.description,
          postsPerPage: categoryEdge.node.acfCustomFields?.postsPerPage,
        }));

        setCategories(categoriesList);

        const firstCategory = categoriesList[0];
        if (firstCategory) {
          setActiveCategory(firstCategory.slug);
          setBackgroundImage(firstCategory.mediaItemUrl);
          setBackgroundImageCaption(firstCategory.caption);
          setPostsPerPage(firstCategory.postsPerPage || 12);
        }
      } else {
        setError("Aucune catégorie correspondante trouvée.");
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
      setLoadingPagination(true); // Active le chargement de la pagination

      const response = await client.query({
        query: INFO_POSTS,
        variables: {
          categoryName: categoryName,
          postPerPage: postsPerPage,
        },
      });

      const { postsPagesByCategoryName } = response.data.postsCategoryInfos;

      setTotalPages(postsPagesByCategoryName);
    } catch (err) {
      setError("Erreur lors de la récupération des informations de la catégorie.");
    } finally {
      setLoadingPagination(false); // Désactive le chargement de la pagination
    }
  };

  // Récupération des posts d'une catégorie avec pagination
  const [pageInfo, setPageInfo] = useState({
    endCursor: null,
    hasNextPage: false,
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
          after: after,
        },
      });

      const fetchedPosts = response.data.posts.nodes;
      const newPageInfo = response.data.posts.pageInfo;

      const formattedPosts = fetchedPosts.map((post: any) => ({
        ...post,
        date: format(new Date(post.date), "dd MMMM yyyy", { locale: fr }),
        modified: format(new Date(post.modified), "dd MMMM yyyy", { locale: fr }),
      }));

      setPosts(formattedPosts);
      setPageInfo(newPageInfo);
    } catch (err) {
      setError("Erreur lors de la récupération des posts.");
    } finally {
      setLoading(false);
    }
  };

  // Gestion du changement de catégorie
  const handleCategoryClick = async (slug: string, name: string) => {
    setActiveCategory(slug);
    setCurrentPage(1); // Réinitialiser la pagination à la première page
  
    const selectedCategory = categories.find((category) => category.slug === slug);
    if (selectedCategory) {
      setPostsPerPage(selectedCategory.postsPerPage || 12);
      setBackgroundImage(selectedCategory.mediaItemUrl);
      setBackgroundImageCaption(selectedCategory.caption);

      await fetchCategoryInfo(selectedCategory.name);  // Récupérer la pagination avant de charger les posts
      fetchPostsForCategory(slug, 1);  // Charger les posts pour la page 1
    }
  };

  // Fonction de gestion de la page
  const handlePageChange = (after: string | null, resetPosts: boolean = false) => {
    if (resetPosts) {
      setPosts([]);
      setCurrentPage(1);
    } else {
      setCurrentPage((prevPage) => prevPage + 1);
    }

    const selectedCategory = categories.find((category) => category.slug === activeCategory);
    if (selectedCategory) {
      setPostsPerPage(selectedCategory.postsPerPage || 12);
      fetchCategoryInfo(selectedCategory.name);  // Met à jour la pagination
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchSiteInfo();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeCategory && currentPage) {
      fetchPostsForCategory(activeCategory, currentPage);
    }
  }, [activeCategory, currentPage]);

  // Si des erreurs ou des chargements
  if (loading || loadingPagination) {
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
      {categories.length > 0 ? (
        <Header
          categories={categories}
          siteTitle={siteInfo.title}
          siteDescription={siteInfo.description}
          siteIconLink={siteInfo.icon}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
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
        pageInfo={pageInfo}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <footer className="footer bg-gray-800 text-white text-center p-4">
        <p>© 2024 {siteInfo.title}. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default Home;
