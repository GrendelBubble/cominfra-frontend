interface BodyProps {
    activeCategory: string | null;
    posts: any[];
  }
  
  export const Body: React.FC<BodyProps> = ({ activeCategory, posts }) => {
    return (
      <main className="main bg-gray-50 min-h-screen py-8 px-4 sm:px-8">
        {activeCategory ? (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Articles pour la catégorie : {activeCategory}
            </h2>
  
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {posts.map((post) => {
                  // Récupère un extrait du contenu (ici les 200 premiers caractères)
                  const excerpt = post.content.substring(0, 200);
  
                  return (
                    <article
                      key={post.slug}
                      className="p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
                    >
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4">{post.title}</h3>
                      <div
                        className="text-lg text-gray-700 leading-relaxed text-justify"
                        dangerouslySetInnerHTML={{
                          __html: excerpt, // Utilise l'extrait du contenu
                        }}
                      />
                      <div className="text-right mt-4">
                        <a
                          href={`/post/${post.slug}`} // Lien vers la page complète de l'article
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Lire la suite
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500">Aucun article trouvé pour cette catégorie.</p>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">Veuillez sélectionner une catégorie.</p>
        )}
      </main>
    );
  };
  