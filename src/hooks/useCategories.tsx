import { useState, useEffect } from 'react';
import client from '../lib/apollo-client';
import { gql } from '@apollo/client';

const LIST_CATEGORIES = gql`
  query GetFilteredCategories {
    categories(
      where: { parent: null, exclude: "1", orderby: DESCRIPTION, order: ASC }
    ) {
      nodes {
        name
      }
    }
  }
`;

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>([]); // Déclare le type comme string[]

  const fetchCategories = async () => {
    try {
      const response = await client.query({
        query: LIST_CATEGORIES,
      });
      const categoryNames = response.data.categories.nodes.map((category: { name: string }) => category.name);
      setCategories(categoryNames);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return categories;
};
