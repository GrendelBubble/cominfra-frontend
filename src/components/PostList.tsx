// components/PostList.tsx
import React from 'react';

type Post = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
};

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <a
                href={`/posts/${post.slug}`}
                className="text-blue-500 hover:underline"
              >
                Lire plus
              </a>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucun post disponible.</p>
        )}
      </div>
    </section>
  );
};

export default PostList;
