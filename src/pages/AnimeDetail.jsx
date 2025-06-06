import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jikanAPI } from '../services/api.js';

export default function AnimeDetail() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnime() {
      try {
        const response = await fetch(`${jikanAPI}/anime/${id}`);
        const data = await response.json();
        setAnime(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener el anime:', error);
      }
    }

    fetchAnime();
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (!anime) return <p>No se encontró el anime.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{anime.title}</h1>
      <img src={anime.images.jpg.image_url} alt={anime.title} style={{ width: '200px' }} />
      <p><strong>Sinopsis:</strong> {anime.synopsis}</p>
      <p><strong>Score:</strong> {anime.score}</p>
      <p><strong>Episodios:</strong> {anime.episodes}</p>
      <p><strong>Estado:</strong> {anime.status}</p>
      <a href={anime.url} target="_blank" rel="noopener noreferrer">Ver en MyAnimeList</a>
    </div>
  );
}
