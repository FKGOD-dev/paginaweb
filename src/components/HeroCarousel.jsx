import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { jikanAPI } from '../services/api.js';

export default function HeroCarousel() {
  const [topAnimes, setTopAnimes] = useState([]);

  useEffect(() => {
    async function fetchTopAnimes() {
      try {
        const response = await fetch(`${jikanAPI}/top/anime`);
        const data = await response.json();
        setTopAnimes(data.data.slice(0, 3));
      } catch (error) {
        console.error('Error al cargar los animes destacados:', error);
      }
    }
    fetchTopAnimes();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 800,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  return (
    <div style={{ width: '100%', padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Slider {...settings}>
        {topAnimes.map((anime) => (
          <div key={anime.mal_id} style={{
            display: 'flex',
            background: '#1e1e2f',
            borderRadius: '10px',
            overflow: 'hidden',
            height: '300px'
          }}>
            <img
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              style={{ height: '100%', width: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1rem', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ color: '#00c6ff' }}>{anime.title}</h2>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                {anime.synopsis?.slice(0, 250)}...
              </p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
