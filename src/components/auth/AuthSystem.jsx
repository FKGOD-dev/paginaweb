// components/auth/AuthSystem.jsx
import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Star,
  Sparkles,
  Heart,
  BookOpen,
  Play,
  MessageCircle
} from 'lucide-react';

const AuthSystem = ({ onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' o 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // Frases motivacionales
  const motivationalQuotes = [
    "¡Descubre tu próximo anime favorito!",
    "Únete a la comunidad otaku más grande",
    "Comparte tu pasión por el anime y manga",
    "Tu aventura otaku comienza aquí",
    "Conecta con fans de todo el mundo"
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular llamada a API
    setTimeout(() => {
      setLoading(false);
      console.log('Auth submitted:', formData);
      // Aquí iría la lógica real de autenticación
      if (onClose) onClose();
    }, 2000);
  };

  const handleGoogleAuth = () => {
    console.log('Google auth');
    // Aquí iría la lógica de Google Auth
  };

  const handleAppleAuth = () => {
    console.log('Apple auth');
    // Aquí iría la lógica de Apple Auth
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-auto max-h-[90vh] overflow-hidden flex">
        {/* Panel izquierdo - Información visual */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 flex-col justify-center relative overflow-hidden">
          {/* Decoraciones de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-white rounded-full animate-pulse delay-300"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full animate-pulse delay-700"></div>
          </div>

          <div className="relative z-10 text-white">
            {/* Logo o icono principal */}
            <div className="mb-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">AnimeVerse</h2>
              <p className="text-blue-100">Tu mundo otaku te espera</p>
            </div>

            {/* Frase motivacional */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-300" />
                {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
              </h3>
            </div>

            {/* Características destacadas */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Lectura Premium</h4>
                  <p className="text-sm text-blue-100">Miles de mangas en alta calidad</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Base de Datos Completa</h4>
                  <p className="text-sm text-blue-100">Información detallada de anime y personajes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Comunidad Activa</h4>
                  <p className="text-sm text-blue-100">Debates, reseñas y recomendaciones</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Sistema de Logros</h4>
                  <p className="text-sm text-blue-100">Gana XP y sube de nivel</p>
                </div>
              </div>
            </div>

            {/* Estadísticas de la comunidad */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-xs text-blue-100">Usuarios activos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-xs text-blue-100">Mangas disponibles</div>
              </div>
              <div>
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-xs text-blue-100">Capítulos leídos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {mode === 'login' 
                    ? 'Ingresa a tu cuenta para continuar tu aventura otaku'
                    : 'Únete a la comunidad otaku más grande del mundo'
                  }
                </p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-4"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Botones sociales */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <button
              onClick={handleAppleAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continuar con Apple
            </button>
          </div>

          {/* Divisor */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                O continúa con email
              </span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="Tu nombre de usuario"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Recordarme
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </>
              )}
            </button>
          </form>

          {/* Toggle entre login y registro */}
          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
              </button>
            </p>
          </div>

          {/* Términos y condiciones para registro */}
          {mode === 'register' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              Al crear una cuenta, aceptas nuestros{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Política de Privacidad
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;