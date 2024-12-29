import React from 'react';

type CategoriesProps = {
  categories: string[];
  onCategorySelect: (category: string) => void; // Ajouter la prop onCategorySelect
};

const CategoriesList: React.FC<CategoriesProps> = React.memo(({ categories, onCategorySelect }) => {
  const handleCategoryClick = (category: string) => {
    onCategorySelect(category); // Appeler la fonction de sélection de catégorie
  };

  return (
    <ul className="menu flex flex-col md:flex-row gap-4 md:gap-6">
      {categories.map((category) => (
        <li key={category} className="menu-item">
          <a
            href={`#${category.toLowerCase()}`}
            className="text-lg hover:underline"
            onClick={(e) => {
              e.preventDefault(); // Empêche le comportement par défaut du lien
              handleCategoryClick(category); // Appelle la fonction onCategorySelect
            }}
          >
            {category}
          </a>
        </li>
      ))}
    </ul>
  );
});
CategoriesList.displayName = 'CategoriesList';

export default CategoriesList;
