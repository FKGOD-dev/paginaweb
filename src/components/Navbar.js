import React from 'https://unpkg.com/react@18/umd/react.development.js';
import { Link } from 'https://unpkg.com/react-router-dom@6/umd/react-router-dom.development.js';

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/explore">Explorar</Link>
      <Link to="/reader">Lector</Link>
      <Link to="/profile">Perfil</Link>
      <Link to="/forum">Foro</Link>
    </nav>
  );
}
