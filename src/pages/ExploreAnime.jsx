import React, { useState } from 'react';
import SearchFilters from '../components/SearchFilters.jsx';
import ViewToggle from '../components/ViewToggle.jsx';

export default function ExploreAnime() {
  const [filters, setFilters] = useState({});
  const [view, setView] = useState('grid');

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-4">Explorar Animes</h1>
      <SearchFilters onChange={setFilters} />
      <ViewToggle view={view} onChange={setView} />

    </div>
  );
}
