// components/ui/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Cargando...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Skeleton loading para cards
export const CardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
          <div className="h-72 bg-gray-300 dark:bg-gray-700"></div>
          <div className="p-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading específico para búsquedas
export const SearchLoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
      </div>
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Buscando contenido...
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Explorando la base de datos de anime y manga
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;