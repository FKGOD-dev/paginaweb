// src/pages/HomePage.jsx
import React from 'react';
import HeroCarousel from '../components/HeroCarousel.jsx';
import AnimeCarousel from '../components/AnimeCarousel.jsx';

export default function HomePage() {
  return (
    <div>
      <HeroCarousel />
      
      <AnimeCarousel
        title="Más Populares"
        endpoint="/top/anime?filter=bypopularity"
      />

      <AnimeCarousel
        title="Mejor Valorados"
        endpoint="/top/anime?filter=favorite"
      />

      <AnimeCarousel
        title="Clásicos Históricos"
        endpoint="/top/anime"
      />
    </div>
  );
}
