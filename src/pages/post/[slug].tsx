import { GetServerSideProps } from 'next';
import { GET_POST_BY_SLUG } from "../../graphql/queries/post";
import client from '../../lib/apollo-client';
import { format } from "date-fns";
import { fr } from 'date-fns/locale'; // Importer la locale française
import DOMPurify from "dompurify";  // Importation de DOMPurify pour assainir le contenu HTML

// Récupération des données côté serveur (getServerSideProps)
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Vérification que le slug est bien passé dans les params
  if (!params || typeof params.slug !== 'string') {
    return { notFound: true };
  }

  const slug = params.slug;

  try {
    // Appel GraphQL pour récupérer les données du post par slug
    const { data } = await client.query({
      query: GET_POST_BY_SLUG,
      variables: { slug },
    });

    // Vérification que le post existe bien
    if (!data.postBy) {
      return { notFound: true };
    }

    // Retourner les données du post
    return {
      props: {
        post: data.postBy,
      },
    };
  } catch (error) {
    // Si erreur, renvoyer la page 404
    return { notFound: true };
  }
};

interface PostPageProps {
  post: {
    author: {
      node: {
        name: string;
      }
    };
    title: string;
    content: string;
    date: string;
    modified: string;
    slug: string;
    featuredImage: {
      node: {
        sourceUrl: string;
        altText: string;
      };
    };
  };
}

const PostPage = ({ post }: PostPageProps) => {
  // Formater la date de publication avec `date-fns` et la locale française
  const formatteddate = format(new Date(post.date), "dd MMMM yyyy", { locale: fr });

  // Formater la date de modification avec `date-fns` et la locale française
  const formattedmodified = format(new Date(post.modified), "dd MMMM yyyy", { locale: fr });

  // Assainir le contenu HTML côté client uniquement
  const sanitizedHtmlContent = typeof window !== "undefined"
    ? DOMPurify.sanitize(post.content)
    : post.content;  // En dehors du navigateur, on garde le contenu d'origine

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="container mx-auto mb-32 px-4 py-12 text-justify flex-grow">
        {/* Affichage de l'image de mise en avant */}
        {post?.featuredImage?.node?.sourceUrl && (
          <img
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || "Image de mise en avant"}
            className="image"
          />
        )}
        {/* Section Article */}
        <div className="p-8">
          <h3 className="titre">{post.title || "Titre manquant"}</h3>
          <div className="date">
            Edité le {formatteddate} par <span className="font-bold">{post.author.node.name || "Auteur inconnu"}</span>
          </div>
          {post.date !== post.modified && (
            <div className="date">
              Mis à jour le {formattedmodified}
            </div>
          )}
          {/* Rendu sécurisé du contenu HTML */}
          <div dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }} />
        </div>
      </div>
    </div>
  );
};

export default PostPage;
