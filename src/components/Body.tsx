import Link from "next/link";

interface BodyProps {
  activeCategory: string | null;
  posts: any[];
  postsPerPage: number;
  currentPage: number;
  onPageChange: (after: string | null, resetPosts?: boolean) => void;  // Ajout de "resetPosts" pour indiquer la réinitialisation des posts
  pageInfo: { endCursor: string | null; hasNextPage: boolean };  // Informations sur la pagination
  totalPages: number | null; // Nouveau paramètre pour le nombre total de pages
}

export const Body: React.FC<BodyProps> = ({
  activeCategory,
  posts,
  postsPerPage,
  currentPage,
  onPageChange,
  pageInfo,  // Récupération des infos de pagination
  totalPages, // Récupération du nombre total de pages
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      // On change de page vers la précédente et on réinitialise les posts
      onPageChange(null, true); // resetPosts à true pour réinitialiser les posts
    }
  };
  
  const handleNext = () => {
    if (pageInfo.hasNextPage) {
      onPageChange(pageInfo.endCursor);  // Envoi du curseur pour récupérer les posts suivants
    }
  };
  
  const handleFirstPage = () => {
    onPageChange(null, true);  // Revenir à la première page et réinitialiser les posts
  };
  
  const handleLastPage = () => {
    if (totalPages) {
      const after = posts.length > 0 ? posts[posts.length - 1].slug : null;
      onPageChange(after);  // Logique de gestion de la dernière page
    }
  };
  
  return (
    <main className="main bg-gray-50 min-h-screen py-8 px-4 sm:px-8">
      {activeCategory ? (
        <>
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {posts.map((post) => {
                  const excerpt = post.content?.substring(0, 200) || "";

                  return (
                    <article
                      key={post.slug}
                      className="p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
                    >
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4 line-clamp-2">
                        {post.title || "Titre manquant"}
                      </h3>
                      <div
                        className="text-lg text-gray-700 leading-relaxed text-justify line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: excerpt,
                        }}
                      />
                      <div className="text-right mt-4">
                        <Link href={`/post/${post.slug}`} passHref legacyBehavior>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Lire la suite
                          </a>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handleFirstPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  Première page
                </button>

                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  Précédent
                </button>
                <span>Page {currentPage} / {totalPages}</span> {/* Affichez le total des pages */}
                <button
                  onClick={handleNext}
                  disabled={!pageInfo.hasNextPage || currentPage === totalPages}  // Désactive le bouton "Suivant" si pas de page suivante ou si on est à la dernière page
                  className={`px-4 py-2 rounded ${
                    !pageInfo.hasNextPage || currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  Suivant
                </button>

                <button
                  onClick={handleLastPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  Dernière page
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">
              Aucun article trouvé pour cette catégorie.
            </p>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">
          Veuillez sélectionner une catégorie.
        </p>
      )}
    </main>
  );
};
