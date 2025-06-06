// src/pages/AnimeDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jikanAPI } from '../services/api.js';

export default function AnimeDetailPage() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function fetchAnime() {
      try {
        const res = await fetch(`${jikanAPI}/anime/${id}`);
        const data = await res.json();
        setAnime(data.data);
      } catch (error) {
        console.error('Error al cargar el anime:', error);
      }
    }

    async function fetchCharacters() {
      try {
        const res = await fetch(`${jikanAPI}/anime/${id}/characters`);
        const data = await res.json();
        setCharacters(data.data.slice(0, 6));
      } catch (error) {
        console.error('Error al cargar personajes:', error);
      }
    }

    async function fetchRecommendations() {
      try {
        const res = await fetch(`${jikanAPI}/anime/${id}/recommendations`);
        const data = await res.json();
        setRecommendations(data.data.slice(0, 6));
      } catch (error) {
        console.error('Error al cargar recomendaciones:', error);
      }
    }

    fetchAnime();
    fetchCharacters();
    fetchRecommendations();
  }, [id]);

  if (!anime) return <p style={{ padding: '1rem' }}>Cargando información...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          style={{ width: '250px', borderRadius: '10px', objectFit: 'cover' }}
        />
        <div>
          <h1>{anime.title}</h1>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{anime.synopsis}</p>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            <li><strong>Tipo:</strong> {anime.type}</li>
            <li><strong>Episodios:</strong> {anime.episodes}</li>
            <li><strong>Estado:</strong> {anime.status}</li>
            <li><strong>Score:</strong> {anime.score}</li>
            <li><strong>Ranking:</strong> #{anime.rank}</li>
            <li><strong>Popularidad:</strong> #{anime.popularity}</li>
          </ul>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem' }}>Personajes Principales</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {characters.map((char) => (
          <Link
            to={`/character/${char.character.mal_id}`}
            key={char.character.mal_id}
            style={{
              width: '140px',
              background: '#161b22',
              borderRadius: '8px',
              overflow: 'hidden',
              textAlign: 'center',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            <img
              src={char.character.images.jpg.image_url}
              alt={char.character.name}
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
            />
            <div style={{ padding: '0.5rem' }}>
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem', margin: 0 }}>{char.character.name}</p>
              <p style={{ fontSize: '0.8rem', color: '#c9d1d9', margin: 0 }}>{char.role}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 style={{ marginTop: '3rem' }}>Recomendaciones</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {recommendations.map((rec) => (
          <div key={rec.entry.mal_id} style={{
            width: '160px',
            background: '#161b22',
            borderRadius: '8px',
            overflow: 'hidden',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}>
            <img
              src={rec.entry.images.jpg.image_url}
              alt={rec.entry.title}
              style={{ width: '100%', height: '220px', objectFit: 'cover' }}
            />
            <div style={{ padding: '0.5rem' }}>
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem', margin: 0 }}>{rec.entry.title}</p>
              <a href={rec.entry.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: '#58a6ff',
                textDecoration: 'none'
              }}>
                Ver en MAL
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
