// components/ui/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showFirstLast = true,
  showNumbers = true,
  maxVisiblePages = 5,
  className = '' 
}) => {
  // Calcular las páginas visibles
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const buttonClass = "flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-200";
  const activeButtonClass = "flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 transition-colors duration-200";

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* Ir a primera página */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          className={`${buttonClass} rounded-l-md ${isFirstPage ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      )}

      {/* Página anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className={`${buttonClass} ${!showFirstLast ? 'rounded-l-md' : ''} ${isFirstPage ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Números de página */}
      {showNumbers && (
        <>
          {/* Mostrar "..." si hay páginas ocultas al inicio */}
          {visiblePages[0] > 2 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className={buttonClass}
              >
                1
              </button>
              {visiblePages[0] > 3 && (
                <span className="px-2 py-2 text-gray-500 dark:text-gray-400">...</span>
              )}
            </>
          )}

          {/* Páginas visibles */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={page === currentPage ? activeButtonClass : buttonClass}
            >
              {page}
            </button>
          ))}

          {/* Mostrar "..." si hay páginas ocultas al final */}
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 2 && (
                <span className="px-2 py-2 text-gray-500 dark:text-gray-400">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className={buttonClass}
              >
                {totalPages}
              </button>
            </>
          )}
        </>
      )}

      {/* Página siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className={`${buttonClass} ${!showFirstLast ? 'rounded-r-md' : ''} ${isLastPage ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Ir a última página */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
          className={`${buttonClass} rounded-r-md ${isLastPage ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Componente de información de paginación
export const PaginationInfo = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  className = '' 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`text-sm text-gray-700 dark:text-gray-300 ${className}`}>
      Mostrando <span className="font-medium">{startItem}</span> a{' '}
      <span className="font-medium">{endItem}</span> de{' '}
      <span className="font-medium">{totalItems.toLocaleString()}</span> resultados
    </div>
  );
};

// Hook personalizado para manejar la paginación
export const usePagination = (totalItems, itemsPerPage = 20) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll suave hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    totalPages,
    handlePageChange,
    resetPage,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: currentPage * itemsPerPage
  };
};

export default Pagination;