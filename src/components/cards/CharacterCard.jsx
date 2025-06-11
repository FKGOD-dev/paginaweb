// components/cards/CharacterCard.jsx
import React from 'react';
import { Heart, Star, Users } from 'lucide-react';

const CharacterCard = ({ character, onClick }) => {
  const {
    mal_id,
    name,
    images,
    favorites,
    nicknames = [],
    about
  } = character;

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
      onClick={() => onClick && onClick(character)}
    >
      {/* Imagen del personaje */}
      <div className="relative overflow-hidden">
        <img
          src={images?.jpg?.image_url || images?.webp?.image_url || '/placeholder-character.png'}
          alt={name || 'Personaje'}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Overlay con favoritos */}
        {favorites && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-400" />
            <span className="text-xs text-white font-medium">
              {favorites.toLocaleString()}
            </span>
          </div>
        )}
        
        {/* Indicador de popularidad */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">Popular</span>
          </div>
        </div>
      </div>

      {/* Información del personaje */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name || 'Nombre no disponible'}
          </h3>
        </div>

        {/* Apodos/Nicknames */}
        {nicknames && nicknames.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {nicknames.slice(0, 2).map((nickname, index) => (
                <span
                  key={index}
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full"
                >
                  {nickname}
                </span>
              ))}
              {nicknames.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{nicknames.length - 2} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Descripción breve */}
        {about && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
            {truncateText(about, 120)}
          </p>
        )}

        {/* Footer con estadísticas */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {favorites ? `${favorites.toLocaleString()} fans` : 'Personaje'}
            </span>
          </div>
          
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors">
            Ver más →
          </button>
        </div>
      </div>
    </div>
  );
};

// Versión compacta para listas pequeñas
export const CompactCharacterCard = ({ character, onClick }) => {
  const { name, images, favorites } = character;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3"
      onClick={() => onClick && onClick(character)}
    >
      <img
        src={images?.jpg?.image_url || '/placeholder-character.png'}
        alt={name}
        className="w-12 h-12 rounded-full object-cover"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">
          {name}
        </h4>
        {favorites && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {favorites.toLocaleString()} favoritos
          </p>
        )}
      </div>
      <Heart className="w-4 h-4 text-gray-400" />
    </div>
  );
};

export default CharacterCard;