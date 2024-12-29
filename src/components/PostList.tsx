import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaFastBackward, FaFastForward } from 'react-icons/fa';

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
  const postsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentPosts.map((post) => (
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
        ))}
      </div>

      {/* Pagination discrète */}
      <div className="flex justify-center mt-6">
        <nav>
          <ul className="flex items-center space-x-4">
            {/* Première page */}
            <li>
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-gray-500 hover:text-blue-500 disabled:text-gray-300"
              >
                <FaFastBackward size={16} />
              </button>
            </li>

            {/* Page précédente */}
            <li>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-gray-500 hover:text-blue-500 disabled:text-gray-300"
              >
                <FaChevronLeft size={16} />
              </button>
            </li>

            {/* Page suivante */}
            <li>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-500 hover:text-blue-500 disabled:text-gray-300"
              >
                <FaChevronRight size={16} />
              </button>
            </li>

            {/* Dernière page */}
            <li>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-500 hover:text-blue-500 disabled:text-gray-300"
              >
                <FaFastForward size={16} />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
};

export default PostList;
