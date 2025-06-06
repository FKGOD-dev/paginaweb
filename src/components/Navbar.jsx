import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-content">
        <div className="navbar-logo">
          <span>🎌 MangaVerse</span>
        </div>
        <div className="navbar-links">
          <Link to="/">Inicio</Link>
          <Link to="/explore">Explorar</Link>
          <Link to="/reader">Lector</Link>
          <Link to="/profile">Perfil</Link>
          <Link to="/forum">Foro</Link>
        </div>
      </div>
    </nav>
  );
}
