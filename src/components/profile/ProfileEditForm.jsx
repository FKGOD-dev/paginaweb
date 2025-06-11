// src/components/profile/ProfileEditForm.jsx
import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  MapPin, 
  Link, 
  Calendar,
  User,
  Mail,
  Lock,
  Globe,
  Twitter,
  Instagram,
  Github,
  Youtube,
  Twitch,
  MessageCircle
} from 'lucide-react';

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    birthDate: user?.birthDate || '',
    profileImage: user?.profileImage || '',
    bannerImage: user?.bannerImage || '',
    isPrivate: user?.isPrivate || false,
    socialLinks: user?.socialLinks || {
      twitter: '',
      instagram: '',
      github: '',
      youtube: '',
      twitch: '',
      discord: ''
    },
    preferences: user?.preferences || {
      favoriteGenres: [],
      language: 'es',
      theme: 'dark',
      notifications: {
        newChapters: true,
        comments: true,
        likes: true,
        follows: true
      }
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const profileImageRef = useRef(null);
  const bannerImageRef = useRef(null);

  const genres = [
    'Shonen', 'Seinen', 'Shoujo', 'Josei', 'Mecha', 'Romance', 'Comedy',
    'Drama', 'Action', 'Adventure', 'Fantasy', 'Sci-Fi', 'Horror', 'Mystery',
    'Psychological', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        favoriteGenres: prev.preferences.favoriteGenres.includes(genre)
          ? prev.preferences.favoriteGenres.filter(g => g !== genre)
          : [...prev.preferences.favoriteGenres, genre]
      }
    }));
  };

  const handleImageUpload = (type, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [type]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (formData.bio.length > 500) {
      newErrors.bio = 'La biografía no puede exceder 500 caracteres';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'La URL del sitio web debe ser válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
              <button
                onClick={onCancel}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Banner and Profile Images */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen de Banner
                </label>
                <div 
                  className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => bannerImageRef.current?.click()}
                >
                  {formData.bannerImage && (
                    <img 
                      src={formData.bannerImage} 
                      alt="Banner" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={48} className="text-white" />
                  </div>
                  <input
                    ref={bannerImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload('bannerImage', e.target.files[0])}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Foto de Perfil
                </label>
                <div className="flex items-center space-x-4">
                  <div 
                    className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                    onClick={() => profileImageRef.current?.click()}
                  >
                    {formData.profileImage ? (
                      <img 
                        src={formData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <User size={32} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <input
                    ref={profileImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload('profileImage', e.target.files[0])}
                  />
                  <div className="text-sm text-gray-400">
                    Haz clic para cambiar tu foto de perfil
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User size={16} className="inline mr-2" />
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu nombre de usuario"
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre Público
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Como quieres que te vean otros usuarios"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ciudad, País"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Link size={16} className="inline mr-2" />
                  Sitio Web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://tu-sitio.com"
                />
                {errors.website && (
                  <p className="text-red-400 text-sm mt-1">{errors.website}</p>
                )}
              </div>
            </div>

            {/* Biography */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biografía
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Cuéntanos sobre ti..."
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Máximo 500 caracteres</span>
                <span className={formData.bio.length > 500 ? 'text-red-400' : ''}>
                  {formData.bio.length}/500
                </span>
              </div>
              {errors.bio && (
                <p className="text-red-400 text-sm mt-1">{errors.bio}</p>
              )}
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Redes Sociales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  twitter: { icon: Twitter, placeholder: '@usuario' },
                  instagram: { icon: Instagram, placeholder: '@usuario' },
                  github: { icon: Github, placeholder: 'usuario' },
                  youtube: { icon: Youtube, placeholder: '@canal' },
                  twitch: { icon: Twitch, placeholder: 'usuario' },
                  discord: { icon: MessageCircle, placeholder: 'Usuario#1234' }
                }).map(([platform, { icon: Icon, placeholder }]) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                      <Icon size={16} className="inline mr-2" />
                      {platform}
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks[platform]}
                      onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Genres */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Géneros Favoritos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {genres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.preferences.favoriteGenres.includes(genre)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Configuración de Privacidad</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Perfil privado</span>
                </label>
                
                <div className="ml-8 space-y-2">
                  <p className="text-sm text-gray-400">
                    Con un perfil privado, solo los usuarios que sigas podrán ver tu actividad y listas.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Notificaciones</h3>
              <div className="space-y-3">
                {Object.entries({
                  newChapters: 'Nuevos capítulos de series seguidas',
                  comments: 'Comentarios en mis publicaciones',
                  likes: 'Me gustas en mis comentarios',
                  follows: 'Nuevos seguidores'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name={`preferences.notifications.${key}`}
                      checked={formData.preferences.notifications[key]}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;