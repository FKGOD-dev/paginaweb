// src/components/AnimeSection.jsx
import React, { useEffect, useState } from 'react';
import AnimeCard from './AnimeCard.jsx';
import { jikanAPI } from '../services/api.js';

export default function AnimeSection({ title, endpoint, limit = 10 }) {
  const [animes, setAnimes] = useState([]);

  useEffect(() => {
    async function fetchAnimes() {
      try {
        const response = await fetch(`${jikanAPI}${endpoint}`);
        const data = await response.json();
        setAnimes(data.data.slice(0, limit));
      } catch (error) {
        console.error(`Error al obtener ${title.toLowerCase()}:`, error);
      }
    }
    fetchAnimes();
  }, [endpoint, title, limit]);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ color: '#00c6ff', paddingLeft: '1rem' }}>{title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {animes.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </div>
  );
}