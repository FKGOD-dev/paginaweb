// components/rankings/RankingSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Award,
  Flame,
  Target,
  BookOpen,
  MessageCircle,
  Heart,
  Eye,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

// Datos mock para el ranking
const generateMockUsers = () => {
  const names = [
    'SakuraOtaku', 'NarutoFan2024', 'OnePieceLover', 'AnimeMaster', 'MangaReader',
    'TokyoGhoul', 'AttackOnFan', 'DragonBallZ', 'StudioGhibli', 'MyHeroAcad',
    'DemonSlayer', 'JujutsuSorcerer', 'ChainSawMan', 'SpyFamily', 'Evangelion',
    'CowboyBebop', 'FullMetal', 'HunterX', 'Bleach_Fan', 'NarutoBelieve'
  ];
  
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5'
  ];

  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    username: names[i % names.length] + (i > 19 ? Math.floor(i/20) : ''),
    avatar: avatars[i % avatars.length],
    level: Math.floor(Math.random() * 50) + 1,
    totalXP: Math.floor(Math.random() * 50000) + 1000,
    weeklyXP: Math.floor(Math.random() * 2000) + 100,
    rank: i + 1,
    weeklyRank: Math.floor(Math.random() * 50) + 1,
    stats: {
      chaptersRead: Math.floor(Math.random() * 1000) + 50,
      reviews: Math.floor(Math.random() * 100) + 5,
      comments: Math.floor(Math.random() * 500) + 20,
      favorites: Math.floor(Math.random() * 200) + 10,
      streak: Math.floor(Math.random() * 100) + 1
    },
    badges: ['Crítico Experto', 'Lector Voraz', 'Comentarista Activo'].slice(0, Math.floor(Math.random() * 3) + 1),
    isCurrentUser: i === 15 // Usuario actual está en posición 16
  }));
};

const RankingSystem = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [filterType, setFilterType] = useState('all');
  const [showUserDetails, setShowUserDetails] = useState(null);

  useEffect(() => {
    setUsers(generateMockUsers());
  }, []);

  // Obtener el color del ranking según la posición
  const getRankColor = (position) => {
    if (position === 1) return 'text-yellow-500'; // Oro
    if (position === 2) return 'text-gray-400'; // Plata
    if (position === 3) return 'text-orange-600'; // Bronce
    if (position <= 10) return 'text-blue-600'; // Top 10
    return 'text-gray-600'; // Resto
  };

  // Obtener el icono según la posición
  const getRankIcon = (position) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    if (position <= 10) return <Trophy className="w-5 h-5 text-blue-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">#{position}</span>;
  };

  // Filtrar usuarios según el tipo
  const getFilteredUsers = () => {
    const sortedUsers = activeTab === 'global' 
      ? [...users].sort((a, b) => b.totalXP - a.totalXP)
      : [...users].sort((a, b) => b.weeklyXP - a.weeklyXP);

    if (filterType === 'all') return sortedUsers;
    
    // Aquí podrías agregar más filtros como por región, etc.
    return sortedUsers;
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Ranking de la Comunidad
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Compite con otros otakus, gana XP y sube en el ranking. ¡Demuestra quién es el verdadero fan del anime y manga!
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger value="global" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Ranking Global
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Semanal
              </TabsTrigger>
            </TabsList>

            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="all">Todos los usuarios</option>
                <option value="beginners">Principiantes (Nivel 1-10)</option>
                <option value="intermediate">Intermedios (Nivel 11-25)</option>
                <option value="advanced">Avanzados (Nivel 26+)</option>
              </select>
            </div>
          </div>

          {/* Podio Top 3 */}
          <div className="mb-8">
            <PodiumSection users={filteredUsers.slice(0, 3)} activeTab={activeTab} />
          </div>

          {/* Lista de Rankings */}
          <TabsContent value="global">
            <RankingList 
              users={filteredUsers} 
              title="Ranking Global por XP Total"
              subtitle="Los usuarios más activos de todos los tiempos"
              scoreKey="totalXP"
              onUserClick={setShowUserDetails}
            />
          </TabsContent>

          <TabsContent value="weekly">
            <RankingList 
              users={filteredUsers} 
              title="Ranking Semanal"
              subtitle="Los más activos esta semana"
              scoreKey="weeklyXP"
              onUserClick={setShowUserDetails}
            />
          </TabsContent>
        </Tabs>

        {/* Modal de detalles del usuario */}
        {showUserDetails && (
          <UserDetailsModal 
            user={showUserDetails} 
            onClose={() => setShowUserDetails(null)} 
          />
        )}
      </div>
    </div>
  );
};

// Componente del podio
const PodiumSection = ({ users, activeTab }) => {
  if (users.length < 3) return null;

  const [first, second, third] = users;

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <Crown className="w-6 h-6 text-yellow-300" />
          Top 3 {activeTab === 'global' ? 'Global' : 'Semanal'}
        </h3>

        <div className="flex justify-center items-end gap-4 md:gap-8">
          {/* Segundo lugar */}
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src={second.avatar}
                alt={second.username}
                className="w-16 h-16 rounded-full border-4 border-gray-300 mx-auto"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
            </div>
            <h4 className="font-bold text-lg">{second.username}</h4>
            <p className="text-gray-200">Nivel {second.level}</p>
            <p className="text-sm text-gray-300">
              {activeTab === 'global' 
                ? `${second.totalXP.toLocaleString()} XP`
                : `${second.weeklyXP.toLocaleString()} XP esta semana`
              }
            </p>
            <div className="mt-2 h-16 bg-gray-400 rounded-t-lg flex items-end justify-center">
              <Medal className="w-6 h-6 text-white mb-2" />
            </div>
          </div>

          {/* Primer lugar */}
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src={first.avatar}
                alt={first.username}
                className="w-20 h-20 rounded-full border-4 border-yellow-400 mx-auto"
              />
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
            </div>
            <h4 className="font-bold text-xl">{first.username}</h4>
            <p className="text-yellow-200">Nivel {first.level}</p>
            <p className="text-sm text-gray-200">
              {activeTab === 'global' 
                ? `${first.totalXP.toLocaleString()} XP`
                : `${first.weeklyXP.toLocaleString()} XP esta semana`
              }
            </p>
            <div className="mt-2 h-20 bg-yellow-500 rounded-t-lg flex items-end justify-center">
              <Crown className="w-8 h-8 text-white mb-2" />
            </div>
          </div>

          {/* Tercer lugar */}
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src={third.avatar}
                alt={third.username}
                className="w-16 h-16 rounded-full border-4 border-orange-400 mx-auto"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
            </div>
            <h4 className="font-bold text-lg">{third.username}</h4>
            <p className="text-orange-200">Nivel {third.level}</p>
            <p className="text-sm text-gray-300">
              {activeTab === 'global' 
                ? `${third.totalXP.toLocaleString()} XP`
                : `${third.weeklyXP.toLocaleString()} XP esta semana`
              }
            </p>
            <div className="mt-2 h-12 bg-orange-600 rounded-t-lg flex items-end justify-center">
              <Medal className="w-5 h-5 text-white mb-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lista de ranking
const RankingList = ({ users, title, subtitle, scoreKey, onUserClick }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.slice(0, 20).map((user, index) => {
          const position = index + 1;
          return (
            <div
              key={user.id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                user.isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => onUserClick(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Posición */}
                  <div className="w-12 flex justify-center">
                    {getRankIcon(position)}
                  </div>

                  {/* Avatar y info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {user.username}
                        </h4>
                        {user.isCurrentUser && (
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Nivel {user.level}</span>
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{user.stats.streak} días</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    {user[scoreKey].toLocaleString()} XP
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{user.stats.chaptersRead}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{user.stats.reviews}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{user.stats.favorites}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ver más */}
      <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          Ver más usuarios →
        </button>
      </div>
    </div>
  );
};

// Modal de detalles del usuario
const UserDetailsModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Perfil de Usuario
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Información del usuario */}
          <div className="text-center mb-6">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-200 dark:border-blue-800"
            />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {user.username}
            </h4>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                Nivel {user.level}
              </span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                Rank #{user.rank}
              </span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.stats.chaptersRead}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Capítulos leídos</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.stats.reviews}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.stats.favorites}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Favoritos</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.stats.streak}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Días seguidos</p>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-6">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Logros</h5>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge, index) => (
                <span
                  key={index}
                  className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Ver Perfil Completo
            </button>
            <button className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              Seguir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingSystem;