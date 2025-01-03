import { GetServerSideProps } from 'next';
import { GET_POST_BY_SLUG } from "../../graphql/queries/post";
import client from '../../lib/apollo-client';

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
    title: string;
    content: string;
    date: string;
    slug: string;
  };
}

const PostPage = ({ post }: PostPageProps) => {
  const formattedDate = new Date(post.date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Article Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <p className="text-gray-600 mb-8">{formattedDate}</p>

            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
