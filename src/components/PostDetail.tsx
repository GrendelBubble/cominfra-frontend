import { useState, useEffect } from "react";

interface PostDetailProps {
  slug: string;
  posts: any[];
}

const PostDetail: React.FC<PostDetailProps> = ({ slug, posts }) => {
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    // Chercher le post correspondant au slug
    const foundPost = posts.find((p) => p.slug === slug);
    setPost(foundPost || null);
  }, [slug, posts]);

  if (!post) {
    return <div>Post non trouvé.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-4xl font-semibold text-gray-900">{post.title}</h1>
      <div className="content mt-6 text-lg text-gray-700 leading-relaxed">
        {/* Affichage du contenu HTML du post */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      <div className="text-right mt-6">
        <a
          href="/"
          className="inline-block px-4 py-2 text-white bg-blue-600 hover:bg-blue-800 rounded-lg font-semibold"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default PostDetail;
