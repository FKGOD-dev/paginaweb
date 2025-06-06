// src/pages/CharacterDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jikanAPI } from '../services/api.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CharacterDetailPage() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    async function fetchCharacter() {
      try {
        const res = await fetch(`${jikanAPI}/characters/${id}/full`);
        const data = await res.json();
        setCharacter(data.data);
      } catch (error) {
        console.error('Error al cargar personaje:', error);
      }
    }

    fetchCharacter();
  }, [id]);

  if (!character) return <p className="p-4">Cargando personaje...</p>;

  const japaneseSeiyuu =
    character.voices?.find((v) => v.language === 'Japanese')?.person.name || 'Desconocido';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row gap-6 bg-[#161b22] p-4 rounded-lg shadow-md">
        <img
          src={character.images.jpg.image_url}
          alt={character.name}
          className="w-40 md:w-52 rounded-lg object-cover self-start"
        />
        <div>
          <h1 className="text-3xl font-bold mb-1 text-white">{character.name}</h1>
          <h3 className="text-gray-400 text-xl mb-2">{character.name_kanji}</h3>
          <p className="text-sm text-gray-300 mb-3">
            {character.about?.split('\n')[0] || 'Sin biografía disponible.'}
          </p>
          {character.voices?.length > 0 && (
            <p className="text-sm text-gray-400">
              <strong>Seiyuu (JP):</strong> {japaneseSeiyuu}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="anime" className="w-full">
        <TabsList className="bg-[#1c1f26] p-1 rounded-md shadow border border-[#2a2a2a] flex gap-4 justify-center">
          <TabsTrigger
            value="anime"
            className="px-5 py-2 text-sm font-semibold text-white bg-[#2a2f3a] rounded-md transition-all hover:bg-[#353b48] data-[state=active]:bg-[#3a3f4b] data-[state=active]:text-white"
          >
            Anime
          </TabsTrigger>
          <TabsTrigger
            value="manga"
            className="px-5 py-2 text-sm font-semibold text-white bg-[#2a2f3a] rounded-md transition-all hover:bg-[#353b48] data-[state=active]:bg-[#3a3f4b] data-[state=active]:text-white"
          >
            Manga
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anime">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-8 mt-6 justify-center">
            {character.anime.slice(0, 6).map((anime) => (
              <div
                key={anime.anime.mal_id}
                className="bg-[#161b22] rounded-lg overflow-hidden shadow hover:scale-[1.03] transition w-full max-w-[140px] mx-auto"
              >
                <div className="w-full h-[170px]">
                  <img
                    src={anime.anime.images.jpg.image_url}
                    alt={anime.anime.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 text-center">
                  <p
                    className="text-xs font-semibold text-white leading-tight truncate"
                    title={anime.anime.title}
                  >
                    {anime.anime.title}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{anime.role}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manga">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-8 mt-6 justify-center">
            {character.manga.slice(0, 6).map((m) => (
              <div
                key={m.manga.mal_id}
                className="bg-[#161b22] rounded-lg overflow-hidden shadow hover:scale-[1.03] transition w-full max-w-[140px] mx-auto"
              >
                <div className="w-full h-[170px]">
                  <img
                    src={m.manga.images.jpg.image_url}
                    alt={m.manga.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 text-center">
                  <p
                    className="text-xs font-semibold text-white leading-tight truncate"
                    title={m.manga.title}
                  >
                    {m.manga.title}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
