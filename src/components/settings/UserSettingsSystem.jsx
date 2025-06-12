// src/components/settings/UserSettingsSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail,
  Phone,
  Calendar,
  MapPin,
  Link,
  Camera,
  Save,
  X,
  Check,
  AlertCircle,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Languages,
  Heart,
  Star,
  MessageCircle,
  Users,
  Play,
  BookOpen,
  Award,
  Zap,
  Crown,
  Gift,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  ExternalLink,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const UserSettingsSystem = ({ user, onUpdateUser, onClose }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile Settings
    profile: {
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      birthDate: user?.birthDate || '',
      gender: user?.gender || '',
      avatar: user?.avatar || '',
      banner: user?.banner || '',
      isPrivate: user?.isPrivate || false
    },
    
    // Notification Settings
    notifications: {
      email: {
        enabled: true,
        newFollowers: true,
        comments: true,
        likes: true,
        mentions: true,
        newEpisodes: true,
        recommendations: true,
        newsletter: false,
        weeklyDigest: true
      },
      push: {
        enabled: true,
        newFollowers: true,
        comments: true,
        likes: false,
        mentions: true,
        newEpisodes: true,
        liveStreams: false
      },
      sound: {
        enabled: true,
        volume: 50,
        newMessage: true,
        achievements: true
      }
    },
    
    // Privacy Settings
    privacy: {
      profileVisibility: 'public', // public, friends, private
      activityVisibility: 'public',
      listsVisibility: 'public',
      showOnlineStatus: true,
      allowDirectMessages: 'everyone', // everyone, friends, none
      showInSearch: true,
      dataCollection: true,
      analytics: true
    },
    
    // Display Settings
    display: {
      theme: 'dark', // light, dark, auto
      language: 'es',
      timezone: 'America/Argentina/Buenos_Aires',
      dateFormat: 'DD/MM/YYYY',
      autoplay: true,
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium', // small, medium, large
      density: 'comfortable' // compact, comfortable, spacious
    },
    
    // Content Preferences
    content: {
      maturityFilter: 'teen', // all, teen, mature
      spoilerProtection: true,
      autoMarkWatched: true,
      defaultWatchStatus: 'plan_to_watch',
      showAdultContent: false,
      hideDropped: false,
      defaultPrivacy: 'public'
    },
    
    // Account Security
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: '7d',
      allowedDevices: 'unlimited'
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const settingSections = [
    { 
      id: 'profile', 
      label: 'Perfil', 
      icon: User, 
      description: 'Información personal y pública' 
    },
    { 
      id: 'notifications', 
      label: 'Notificaciones', 
      icon: Bell, 
      description: 'Configurar alertas y avisos' 
    },
    { 
      id: 'privacy', 
      label: 'Privacidad', 
      icon: Shield, 
      description: 'Control de visibilidad y datos' 
    },
    { 
      id: 'display', 
      label: 'Visualización', 
      icon: Palette, 
      description: 'Tema, idioma y apariencia' 
    },
    { 
      id: 'content', 
      label: 'Contenido', 
      icon: Star, 
      description: 'Preferencias de anime y manga' 
    },
    { 
      id: 'security', 
      label: 'Seguridad', 
      icon: Lock, 
      description: 'Contraseña y autenticación' 
    }
  ];

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' }
  ];

  const timezones = [
    'America/Argentina/Buenos_Aires',
    'America/Mexico_City',
    'America/New_York',
    'Europe/Madrid',
    'Europe/London',
    'Asia/Tokyo',
    'UTC'
  ];

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleNestedSettingChange = (section, subsection, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [key]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Validate settings
      const validationErrors = {};
      
      if (settings.profile.displayName.length > 50) {
        validationErrors.displayName = 'Máximo 50 caracteres';
      }
      
      if (settings.profile.bio.length > 500) {
        validationErrors.bio = 'Máximo 500 caracteres';
      }

      if (settings.profile.website && !settings.profile.website.match(/^https?:\/\/.+/)) {
        validationErrors.website = 'URL inválida';
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      await onUpdateUser({
        ...user,
        ...settings.profile,
        settings: settings
      });

      setSaved(true);
    } catch (error) {
      setErrors({ general: 'Error al guardar configuración' });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      setSettings({
        profile: {
          displayName: user?.displayName || '',
          bio: '',
          location: '',
          website: '',
          birthDate: user?.birthDate || '',
          gender: '',
          avatar: user?.avatar || '',
          banner: user?.banner || '',
          isPrivate: false
        },
        notifications: {
          email: {
            enabled: true,
            newFollowers: true,
            comments: true,
            likes: true,
            mentions: true,
            newEpisodes: true,
            recommendations: true,
            newsletter: false,
            weeklyDigest: true
          },
          push: {
            enabled: true,
            newFollowers: true,
            comments: true,
            likes: false,
            mentions: true,
            newEpisodes: true,
            liveStreams: false
          },
          sound: {
            enabled: true,
            volume: 50,
            newMessage: true,
            achievements: true
          }
        },
        privacy: {
          profileVisibility: 'public',
          activityVisibility: 'public',
          listsVisibility: 'public',
          showOnlineStatus: true,
          allowDirectMessages: 'everyone',
          showInSearch: true,
          dataCollection: true,
          analytics: true
        },
        display: {
          theme: 'dark',
          language: 'es',
          timezone: 'America/Argentina/Buenos_Aires',
          dateFormat: 'DD/MM/YYYY',
          autoplay: true,
          reducedMotion: false,
          highContrast: false,
          fontSize: 'medium',
          density: 'comfortable'
        },
        content: {
          maturityFilter: 'teen',
          spoilerProtection: true,
          autoMarkWatched: true,
          defaultWatchStatus: 'plan_to_watch',
          showAdultContent: false,
          hideDropped: false,
          defaultPrivacy: 'public'
        },
        security: {
          twoFactorEnabled: false,
          loginNotifications: true,
          sessionTimeout: '7d',
          allowedDevices: 'unlimited'
        }
      });
    }
  };

  const renderToggle = (checked, onChange, disabled = false) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked 
          ? 'bg-blue-600' 
          : 'bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} 
      />
    </button>
  );

  const renderProfileSettings = () => (
    <div className="space-y-8">
      {/* Avatar and Banner */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Imágenes del Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Foto de Perfil
            </label>
            <div className="flex items-center space-x-4">
              <img 
                src={settings.profile.avatar || '/api/placeholder/80/80'}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="space-y-2">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Camera size={16} />
                  <span>Cambiar</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
                  <Trash2 size={16} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Banner del Perfil
            </label>
            <div className="w-full h-32 bg-gray-700 rounded-lg overflow-hidden relative">
              {settings.profile.banner ? (
                <img 
                  src={settings.profile.banner}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera size={32} className="text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  Cambiar
                </button>
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Información Básica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre para Mostrar
            </label>
            <input
              type="text"
              value={settings.profile.displayName}
              onChange={(e) => handleSettingChange('profile', 'displayName', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Como quieres que te vean otros usuarios"
            />
            {errors.displayName && (
              <p className="text-red-400 text-sm mt-1">{errors.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={settings.profile.birthDate}
              onChange={(e) => handleSettingChange('profile', 'birthDate', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              value={settings.profile.location}
              onChange={(e) => handleSettingChange('profile', 'location', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ciudad, País"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sitio Web
            </label>
            <input
              type="url"
              value={settings.profile.website}
              onChange={(e) => handleSettingChange('profile', 'website', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://tu-sitio.com"
            />
            {errors.website && (
              <p className="text-red-400 text-sm mt-1">{errors.website}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Biografía
            </label>
            <textarea
              value={settings.profile.bio}
              onChange={(e) => handleSettingChange('profile', 'bio', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Cuéntanos sobre ti..."
            />
            <div className="flex justify-between text-sm mt-1">
              <span className={settings.profile.bio.length > 500 ? 'text-red-400' : 'text-gray-400'}>
                {settings.profile.bio.length}/500 caracteres
              </span>
            </div>
            {errors.bio && (
              <p className="text-red-400 text-sm mt-1">{errors.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Privacidad del Perfil</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Perfil Privado</h4>
              <p className="text-gray-400 text-sm">Solo los usuarios que sigas pueden ver tu perfil</p>
            </div>
            {renderToggle(
              settings.profile.isPrivate,
              (value) => handleSettingChange('profile', 'isPrivate', value)
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Notificaciones por Email</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Habilitar notificaciones por email</h4>
              <p className="text-gray-400 text-sm">Recibir notificaciones en tu correo electrónico</p>
            </div>
            {renderToggle(
              settings.notifications.email.enabled,
              (value) => handleNestedSettingChange('notifications', 'email', 'enabled', value)
            )}
          </div>

          {Object.entries({
            newFollowers: 'Nuevos seguidores',
            comments: 'Comentarios en mis publicaciones',
            likes: 'Me gustas en mis contenidos',
            mentions: 'Cuando me mencionan',
            newEpisodes: 'Nuevos episodios de series que sigo',
            recommendations: 'Recomendaciones personalizadas',
            newsletter: 'Newsletter semanal',
            weeklyDigest: 'Resumen semanal de actividad'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <span className="text-white">{label}</span>
              {renderToggle(
                settings.notifications.email[key],
                (value) => handleNestedSettingChange('notifications', 'email', key, value),
                !settings.notifications.email.enabled
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Notificaciones Push</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Habilitar notificaciones push</h4>
              <p className="text-gray-400 text-sm">Recibir notificaciones en el navegador/dispositivo</p>
            </div>
            {renderToggle(
              settings.notifications.push.enabled,
              (value) => handleNestedSettingChange('notifications', 'push', 'enabled', value)
            )}
          </div>

          {Object.entries({
            newFollowers: 'Nuevos seguidores',
            comments: 'Comentarios',
            likes: 'Me gustas',
            mentions: 'Menciones',
            newEpisodes: 'Nuevos episodios',
            liveStreams: 'Transmisiones en vivo'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <span className="text-white">{label}</span>
              {renderToggle(
                settings.notifications.push[key],
                (value) => handleNestedSettingChange('notifications', 'push', key, value),
                !settings.notifications.push.enabled
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sound Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Configuración de Sonido</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Sonidos de notificación</h4>
              <p className="text-gray-400 text-sm">Reproducir sonidos para las notificaciones</p>
            </div>
            {renderToggle(
              settings.notifications.sound.enabled,
              (value) => handleNestedSettingChange('notifications', 'sound', 'enabled', value)
            )}
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            <label className="block text-white font-medium mb-3">
              Volumen: {settings.notifications.sound.volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.notifications.sound.volume}
              onChange={(e) => handleNestedSettingChange('notifications', 'sound', 'volume', parseInt(e.target.value))}
              disabled={!settings.notifications.sound.enabled}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-8">
      {/* Visibility Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Configuración de Visibilidad</h3>
        <div className="space-y-4">
          {[
            { key: 'profileVisibility', label: 'Visibilidad del perfil', desc: 'Quién puede ver tu perfil completo' },
            { key: 'activityVisibility', label: 'Actividad', desc: 'Quién puede ver tu actividad reciente' },
            { key: 'listsVisibility', label: 'Listas', desc: 'Quién puede ver tus listas' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-medium">{label}</h4>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              </div>
              <select
                value={settings.privacy[key]}
                onChange={(e) => handleSettingChange('privacy', key, e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Público</option>
                <option value="friends">Solo amigos</option>
                <option value="private">Privado</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Comunicación</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-medium">Mensajes directos</h4>
                <p className="text-gray-400 text-sm">Quién puede enviarte mensajes privados</p>
              </div>
            </div>
            <select
              value={settings.privacy.allowDirectMessages}
              onChange={(e) => handleSettingChange('privacy', 'allowDirectMessages', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="everyone">Cualquiera</option>
              <option value="friends">Solo amigos</option>
              <option value="none">Nadie</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Mostrar estado en línea</h4>
              <p className="text-gray-400 text-sm">Otros usuarios pueden ver cuando estás activo</p>
            </div>
            {renderToggle(
              settings.privacy.showOnlineStatus,
              (value) => handleSettingChange('privacy', 'showOnlineStatus', value)
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Aparecer en búsquedas</h4>
              <p className="text-gray-400 text-sm">Tu perfil puede aparecer en resultados de búsqueda</p>
            </div>
            {renderToggle(
              settings.privacy.showInSearch,
              (value) => handleSettingChange('privacy', 'showInSearch', value)
            )}
          </div>
        </div>
      </div>

      {/* Data Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Datos y Analíticas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Recopilación de datos</h4>
              <p className="text-gray-400 text-sm">Permitir recopilar datos para mejorar la experiencia</p>
            </div>
            {renderToggle(
              settings.privacy.dataCollection,
              (value) => handleSettingChange('privacy', 'dataCollection', value)
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Analíticas</h4>
              <p className="text-gray-400 text-sm">Compartir datos anónimos para estadísticas</p>
            </div>
            {renderToggle(
              settings.privacy.analytics,
              (value) => handleSettingChange('privacy', 'analytics', value)
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-8">
      {/* Theme Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Tema y Apariencia</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-medium mb-3">Tema</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Claro', icon: Sun },
                { value: 'dark', label: 'Oscuro', icon: Moon },
                { value: 'auto', label: 'Automático', icon: Monitor }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleSettingChange('display', 'theme', value)}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-colors ${
                    settings.display.theme === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-medium mb-3">Tamaño de fuente</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'small', label: 'Pequeña' },
                { value: 'medium', label: 'Mediana' },
                { value: 'large', label: 'Grande' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleSettingChange('display', 'fontSize', value)}
                  className={`p-3 rounded-lg transition-colors ${
                    settings.display.fontSize === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  <span className={`${
                    value === 'small' ? 'text-sm' : 
                    value === 'large' ? 'text-lg' : 'text-base'
                  }`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language and Region */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Idioma y Región</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Idioma
            </label>
            <select
              value={settings.display.language}
              onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Zona Horaria
            </label>
            <select
              value={settings.display.timezone}
              onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Accesibilidad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Reducir animaciones</h4>
              <p className="text-gray-400 text-sm">Minimizar movimientos y transiciones</p>
            </div>
            {renderToggle(
              settings.display.reducedMotion,
              (value) => handleSettingChange('display', 'reducedMotion', value)
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Alto contraste</h4>
              <p className="text-gray-400 text-sm">Aumentar el contraste para mejor visibilidad</p>
            </div>
            {renderToggle(
              settings.display.highContrast,
              (value) => handleSettingChange('display', 'highContrast', value)
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Reproducción automática</h4>
              <p className="text-gray-400 text-sm">Reproducir videos automáticamente</p>
            </div>
            {renderToggle(
              settings.display.autoplay,
              (value) => handleSettingChange('display', 'autoplay', value)
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentSettings = () => (
    <div className="space-y-8">
      {/* Content Filtering */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Filtrado de Contenido</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-medium mb-3">Filtro de madurez</h4>
            <div className="space-y-3">
              {[
                { value: 'all', label: 'Todo el contenido', desc: 'Sin restricciones' },
                { value: 'teen', label: 'Teen y menores', desc: 'Contenido apropiado para adolescentes' },
                { value: 'mature', label: 'Solo contenido maduro', desc: 'Contenido para adultos únicamente' }
              ].map(({ value, label, desc }) => (
                <label key={value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="maturityFilter"
                    value={value}
                    checked={settings.content.maturityFilter === value}
                    onChange={(e) => handleSettingChange('content', 'maturityFilter', e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-white font-medium">{label}</div>
                    <div className="text-gray-400 text-sm">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Protección contra spoilers</h4>
              <p className="text-gray-400 text-sm">Ocultar contenido que pueda contener spoilers</p>
            </div>
            {renderToggle(
              settings.content.spoilerProtection,
              (value) => handleSettingChange('content', 'spoilerProtection', value)
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Mostrar contenido para adultos</h4>
              <p className="text-gray-400 text-sm">Incluir contenido clasificado como adulto</p>
            </div>
            {renderToggle(
              settings.content.showAdultContent,
              (value) => handleSettingChange('content', 'showAdultContent', value)
            )}
          </div>
        </div>
      </div>

      {/* Default Behaviors */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Comportamientos por Defecto</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-medium mb-3">Estado por defecto al agregar</h4>
            <select
              value={settings.content.defaultWatchStatus}
              onChange={(e) => handleSettingChange('content', 'defaultWatchStatus', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="watching">Viendo</option>
              <option value="plan_to_watch">Planeo ver</option>
              <option value="completed">Completado</option>
              <option value="on_hold">En pausa</option>
              <option value="dropped">Abandonado</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Marcar como visto automáticamente</h4>
              <p className="text-gray-400 text-sm">Al llegar al final de un episodio/capítulo</p>
            </div>
            {renderToggle(
              settings.content.autoMarkWatched,
              (value) => handleSettingChange('content', 'autoMarkWatched', value)
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Ocultar series abandonadas</h4>
              <p className="text-gray-400 text-sm">No mostrar contenido marcado como "abandonado"</p>
            </div>
            {renderToggle(
              settings.content.hideDropped,
              (value) => handleSettingChange('content', 'hideDropped', value)
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Autenticación de Dos Factores</h3>
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-medium">Autenticación 2FA</h4>
              <p className="text-gray-400 text-sm">Agregar una capa extra de seguridad a tu cuenta</p>
            </div>
            {renderToggle(
              settings.security.twoFactorEnabled,
              (value) => handleSettingChange('security', 'twoFactorEnabled', value)
            )}
          </div>
          {!settings.security.twoFactorEnabled && (
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              Configurar 2FA
            </button>
          )}
        </div>
      </div>

      {/* Login Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Configuración de Inicio de Sesión</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Notificaciones de inicio de sesión</h4>
              <p className="text-gray-400 text-sm">Recibir alerta cuando alguien acceda a tu cuenta</p>
            </div>
            {renderToggle(
              settings.security.loginNotifications,
              (value) => handleSettingChange('security', 'loginNotifications', value)
            )}
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-medium mb-3">Tiempo de sesión</h4>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">1 hora</option>
              <option value="1d">1 día</option>
              <option value="7d">7 días</option>
              <option value="30d">30 días</option>
              <option value="never">Nunca expirar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Password Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Contraseña</h3>
        <div className="space-y-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* Account Deletion */}
      <div>
        <h3 className="text-lg font-semibold text-red-400 mb-4">Zona de Peligro</h3>
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <h4 className="text-red-400 font-medium mb-2">Eliminar Cuenta</h4>
          <p className="text-gray-300 text-sm mb-4">
            Esta acción es irreversible. Se eliminarán todos tus datos, listas, reseñas y configuraciones.
          </p>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">Configuración</h1>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="space-y-2">
              {settingSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <section.icon size={20} />
                  <div>
                    <div className="font-medium">{section.label}</div>
                    <div className="text-xs opacity-70">{section.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header with Save Button */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {settingSections.find(s => s.id === activeSection)?.label}
                </h2>
                <p className="text-gray-400">
                  {settingSections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={resetToDefaults}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Restaurar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : saved ? (
                    <Check size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{loading ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-500/50 rounded-lg flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-red-400">{errors.general}</span>
              </div>
            )}

            {/* Success Message */}
            {saved && (
              <div className="mb-6 p-4 bg-green-600/20 border border-green-500/50 rounded-lg flex items-center space-x-2">
                <Check size={16} className="text-green-400" />
                <span className="text-green-400">Configuración guardada correctamente</span>
              </div>
            )}

            {/* Section Content */}
            <div className="max-w-4xl">
              {activeSection === 'profile' && renderProfileSettings()}
              {activeSection === 'notifications' && renderNotificationSettings()}
              {activeSection === 'privacy' && renderPrivacySettings()}
              {activeSection === 'display' && renderDisplaySettings()}
              {activeSection === 'content' && renderContentSettings()}
              {activeSection === 'security' && renderSecuritySettings()}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¿Eliminar cuenta?</h3>
              <p className="text-gray-400 mb-6">
                Esta acción es permanente. Todos tus datos, listas, reseñas y configuraciones se eliminarán para siempre.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettingsSystem;