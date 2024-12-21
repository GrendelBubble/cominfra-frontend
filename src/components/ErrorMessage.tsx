// src/components/ErrorMessage/index.tsx

import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-3"
      role="alert"
      dangerouslySetInnerHTML={{ __html: message }}
    />
  );
};

export default ErrorMessage;
