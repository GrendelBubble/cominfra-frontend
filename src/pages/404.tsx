// src/pages/404.tsx

import React from 'react';

const Custom404 = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-2xl mb-5">Page non trouvée</h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200 p-5">
          <p className="text-sm text-gray-700 mt-4">La page que vous recherchez n'existe pas.</p>
        </div>
      </div>
    </div>
  );
};

export default Custom404;
