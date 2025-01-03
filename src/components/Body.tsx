import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import Link from "next/link";

interface BodyProps {
  activeCategory: string | null;
  posts: any[];
  postsPerPage: number; // Nombre d'articles par page
  currentPage: number;
  onPageChange: (after: string | null, resetPosts?: boolean) => void;
  pageInfo: { endCursor: string | null; hasNextPage: boolean };
  totalPages: number | null;
}

export const Body: React.FC<BodyProps> = ({
  activeCategory,
  posts,
  postsPerPage, // Récupère postsPerPage ici
  currentPage,
  onPageChange,
  pageInfo,
  totalPages,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(null, true); // Réinitialiser les posts pour revenir à la première page
    }
  };

  const handleNext = () => {
    if (pageInfo.hasNextPage) {
      onPageChange(pageInfo.endCursor); // Passer à la page suivante avec le curseur
    }
  };

  const handleFirstPage = () => {
    onPageChange(null, true); // Revenir à la première page
  };

  const handleLastPage = () => {
    if (totalPages) {
      const after = posts.length > 0 ? posts[posts.length - 1].slug : null;
      onPageChange(after); // Passer à la dernière page
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
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Lire la suite
                          </a>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Section de pagination */}
              <div className="flex justify-between items-center mt-8">
                {/* Première page */}
                <button
                  onClick={handleFirstPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded flex items-center ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  <FaAngleDoubleLeft className="mr-2" />
                </button>

                {/* Précédent */}
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded flex items-center ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  <FaChevronLeft className="mr-2" />
                </button>

                {/* Page info */}
                <span className="text-lg text-gray-700">
                  Page {currentPage} / {totalPages}
                </span>

                {/* Suivant */}
                <button
                  onClick={handleNext}
                  disabled={!pageInfo.hasNextPage || currentPage === totalPages}
                  className={`px-4 py-2 rounded flex items-center ${
                    !pageInfo.hasNextPage || currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  <FaChevronRight className="mr-2" />
                </button>

                {/* Dernière page */}
                <button
                  onClick={handleLastPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded flex items-center ${
                    currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  <FaAngleDoubleRight className="mr-2" />
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
