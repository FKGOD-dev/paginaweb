import React from 'react';
import { Link } from 'react-router-dom';

export default function AnimeCard({ anime }) {
  return (
    <div className="anime-card-horizontal">
      <img src={anime.images.jpg.image_url} alt={anime.title} />
      <div className="anime-info">
        <h3>{anime.title}</h3>
        <Link to={`/anime/${anime.mal_id}`}>Ver más</Link>
      </div>
    </div>
  );
}
