import React, { useState } from 'react';

export default function SearchFilters({ onChange }) {
  const [form, setForm] = useState({
    q: '',
    genre: '',
    year: '',
    status: '',
  });

  function handleChange(e) {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    onChange(newForm);
  }

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-4">
      <input name="q" placeholder="Nombre..." value={form.q} onChange={handleChange} className="input" />
      <select name="genre" value={form.genre} onChange={handleChange} className="input">
        <option value="">Género</option>
        <option value="1">Acción</option>
        <option value="4">Comedia</option>
        <option value="8">Drama</option>
      </select>
      <input name="year" placeholder="Año..." value={form.year} onChange={handleChange} className="input" />
      <select name="status" value={form.status} onChange={handleChange} className="input">
        <option value="">Estado</option>
        <option value="airing">En emisión</option>
        <option value="complete">Completado</option>
        <option value="upcoming">Próximamente</option>
      </select>
    </div>
  );
}
