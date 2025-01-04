import { GetServerSideProps } from 'next';
import { GET_POST_BY_SLUG } from "../../graphql/queries/post";
import client from '../../lib/apollo-client';
import { format } from "date-fns";
import { fr } from 'date-fns/locale'; // Importer la locale française

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params || typeof params.slug !== 'string') {
    return { notFound: true };
  }

  const slug = params.slug;
  try {
    const { data } = await client.query({
      query: GET_POST_BY_SLUG,
      variables: { slug },
    });

    if (!data.postBy) {
      return { notFound: true };
    }

    return {
      props: {
        post: data.postBy,
      },
    };
  } catch (error) {
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
        {/* Article Section */}
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
          <div
            className="texte"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default PostPage;
