import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { jikanAPI } from '../services/api.js';
import { Link } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function AnimeCarousel({ title, endpoint }) {
  const [animes, setAnimes] = useState([]);

  useEffect(() => {
    async function fetchAnimes() {
      try {
        const response = await fetch(`${jikanAPI}${endpoint}`);
        const data = await response.json();
        setAnimes(data.data.slice(0, 10));
      } catch (error) {
        console.error(`Error al cargar ${title.toLowerCase()}:`, error);
      }
    }
    fetchAnimes();
  }, [endpoint, title]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  };

  return (
    <section>
      <h2>{title}</h2>
      <Slider {...settings}>
        {animes.map((anime) => (
          <div key={anime.mal_id} style={{ padding: '0 0.5rem' }}>
            <div style={{
              display: 'flex',
              backgroundColor: '#161b22',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              height: '220px'
            }}>
              <img
                src={anime.images.jpg.image_url}
                alt={anime.title}
                style={{ width: '150px', objectFit: 'cover' }}
              />
              <div style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: '#f0f6fc'
              }}>
                <h3 style={{ margin: 0 }}>{anime.title}</h3>
                <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  {anime.synopsis?.slice(0, 150)}...
                </p>
                <Link to={`/anime/${anime.mal_id}`} style={{
                  color: '#f0f6fc',
                  background: '#238636',
                  padding: '0.3rem 0.6rem',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  width: 'fit-content',
                  fontWeight: '500'
                }}>
                  Ver más
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}
