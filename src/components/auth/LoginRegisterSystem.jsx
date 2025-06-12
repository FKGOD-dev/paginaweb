// src/components/auth/LoginRegisterSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles,
  Crown,
  Star,
  Heart,
  Play,
  BookOpen,
  Users,
  Zap,
  Shield,
  Gift,
  Calendar,
  Globe,
  ExternalLink,
  Loader,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

const LoginRegisterSystem = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState('login'); // login, register, forgot, verify
  const [step, setStep] = useState(1); // Para registro multi-step
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [registerData, setRegisterData] = useState({
    // Step 1: Basic Info
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Profile Info
    displayName: '',
    birthDate: '',
    gender: '',
    country: '',
    
    // Step 3: Preferences
    favoriteGenres: [],
    experienceLevel: 'intermediate', // beginner, intermediate, expert
    interests: [],
    
    // Step 4: Terms
    agreeToTerms: false,
    agreeToNewsletter: false,
    agreeToRecommendations: true
  });

  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Mock data
  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
    'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
    'Mecha', 'School', 'Military', 'Historical', 'Music', 'Psychological'
  ];

  const interests = [
    { id: 'anime', label: 'Anime', icon: Play },
    { id: 'manga', label: 'Manga', icon: BookOpen },
    { id: 'light_novels', label: 'Light Novels', icon: BookOpen },
    { id: 'community', label: 'Comunidad', icon: Users },
    { id: 'reviews', label: 'Reseñas', icon: Star },
    { id: 'discussions', label: 'Discusiones', icon: Users },
    { id: 'lists', label: 'Listas', icon: Star },
    { id: 'recommendations', label: 'Recomendaciones', icon: Heart }
  ];

  const countries = [
    'Argentina', 'España', 'México', 'Colombia', 'Chile', 'Perú', 'Venezuela',
    'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Estados Unidos', 'Canadá',
    'Brasil', 'Japón', 'Otro'
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const validateUsername = (username) => {
    return {
      length: username.length >= 3 && username.length <= 20,
      alphanumeric: /^[a-zA-Z0-9_]+$/.test(username),
      available: true // Mock - would check with API
    };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors = {};
    if (!loginData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!loginData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful login
      onSuccess({
        user: {
          id: 1,
          email: loginData.email,
          username: 'user123',
          displayName: 'Usuario Demo'
        },
        token: 'mock-jwt-token'
      });
      
      onClose();
    } catch (error) {
      setErrors({ general: 'Credenciales incorrectas' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      setMode('verify');
    } catch (error) {
      setErrors({ general: 'Error al crear la cuenta' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!validateEmail(forgotEmail)) {
      setErrors({ email: 'Email inválido' });
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMode('verify');
    } catch (error) {
      setErrors({ general: 'Error al enviar el email' });
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!registerData.email || !validateEmail(registerData.email)) {
        newErrors.email = 'Email válido requerido';
      }
      
      const usernameValidation = validateUsername(registerData.username);
      if (!registerData.username) {
        newErrors.username = 'Nombre de usuario requerido';
      } else if (!usernameValidation.length) {
        newErrors.username = 'Debe tener entre 3 y 20 caracteres';
      } else if (!usernameValidation.alphanumeric) {
        newErrors.username = 'Solo letras, números y guiones bajos';
      }

      const passwordValidation = validatePassword(registerData.password);
      if (!registerData.password) {
        newErrors.password = 'Contraseña requerida';
      } else if (!passwordValidation.length) {
        newErrors.password = 'Mínimo 8 caracteres';
      }

      if (registerData.password !== registerData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (step === 4) {
      if (!registerData.agreeToTerms) {
        newErrors.terms = 'Debes aceptar los términos y condiciones';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleRegister();
    }
  };

  const handleGenreToggle = (genre) => {
    setRegisterData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleInterestToggle = (interestId) => {
    setRegisterData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(i => i !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const renderPasswordStrength = (password) => {
    const validation = validatePassword(password);
    const score = Object.values(validation).filter(Boolean).length;
    
    const getStrengthColor = () => {
      if (score < 2) return 'bg-red-500';
      if (score < 4) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    const getStrengthText = () => {
      if (score < 2) return 'Débil';
      if (score < 4) return 'Media';
      return 'Fuerte';
    };

    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Fortaleza de contraseña</span>
          <span>{getStrengthText()}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
          {Object.entries({
            length: '8+ caracteres',
            uppercase: 'Mayúscula',
            lowercase: 'Minúscula',
            number: 'Número',
            special: 'Símbolo'
          }).map(([key, label]) => (
            <div key={key} className={`flex items-center space-x-1 ${
              validation[key] ? 'text-green-400' : 'text-gray-500'
            }`}>
              {validation[key] ? <Check size={12} /> : <X size={12} />}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-gray-800 rounded-2xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 flex flex-col justify-center relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-16 h-16 bg-white rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse delay-700"></div>
            </div>

            <div className="relative z-10">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">AnimeVerse</h1>
                </div>
                <p className="text-blue-100 text-lg leading-relaxed">
                  {mode === 'login' && "Bienvenido de vuelta a tu universo de anime y manga"}
                  {mode === 'register' && "Únete a la comunidad más grande de anime y manga"}
                  {mode === 'forgot' && "Recupera el acceso a tu cuenta"}
                  {mode === 'verify' && "Verifica tu cuenta para continuar"}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Play size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Miles de anime</h3>
                    <p className="text-blue-100 text-sm">Descubre y sigue tus series favoritas</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Lector de manga</h3>
                    <p className="text-blue-100 text-sm">Lee manga en alta calidad</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Comunidad activa</h3>
                    <p className="text-blue-100 text-sm">Conecta con otros otakus</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sistema de gamificación</h3>
                    <p className="text-blue-100 text-sm">Gana XP y desbloquea logros</p>
                  </div>
                </div>
              </div>

              {mode === 'register' && (
                <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <h4 className="text-white font-semibold mb-2">¡Beneficios de unirte!</h4>
                  <ul className="text-blue-100 text-sm space-y-1">
                    <li>• Listas personalizadas ilimitadas</li>
                    <li>• Recomendaciones inteligentes</li>
                    <li>• Acceso a debates exclusivos</li>
                    <li>• Sistema de puntos y recompensas</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Forms */}
          <div className="p-8">
            {/* Login Form */}
            {mode === 'login' && (
              <div className="h-full flex flex-col justify-center">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
                  <p className="text-gray-400">Ingresa a tu cuenta para continuar</p>
                </div>

                <div className="space-y-6">
                  {/* Social Login */}
                  <div className="grid grid-cols-1 gap-3">
                    <button className="flex items-center justify-center space-x-3 w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-medium transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continuar con Google</span>
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-800 text-gray-400">o</span>
                    </div>
                  </div>

                  {errors.general && (
                    <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-lg flex items-center space-x-2">
                      <AlertCircle size={16} className="text-red-400" />
                      <span className="text-red-400 text-sm">{errors.general}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                          }`}
                          placeholder="tu@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                            errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                          }`}
                          placeholder="Tu contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={loginData.rememberMe}
                          onChange={(e) => setLoginData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300 text-sm">Recordarme</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>

                    <button
                      onClick={handleLogin}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <Loader className="animate-spin" size={20} />
                      ) : (
                        <>
                          <span>Iniciar Sesión</span>
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <span className="text-gray-400">¿No tienes cuenta? </span>
                    <button
                      onClick={() => setMode('register')}
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Regístrate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <div className="h-full flex flex-col">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Crear Cuenta</h2>
                    <div className="text-sm text-gray-400">
                      Paso {step} de 4
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${(step / 4) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  {/* Step 1: Basic Info */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                              errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                            }`}
                            placeholder="tu@email.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nombre de Usuario *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            value={registerData.username}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                              errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                            }`}
                            placeholder="usuario123"
                          />
                        </div>
                        {errors.username && (
                          <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Contraseña *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={registerData.password}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                            className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                              errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                            }`}
                            placeholder="Mínimo 8 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {registerData.password && renderPasswordStrength(registerData.password)}
                        {errors.password && (
                          <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirmar Contraseña *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                              errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                            }`}
                            placeholder="Repite tu contraseña"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Profile Info */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nombre para Mostrar
                        </label>
                        <input
                          type="text"
                          value={registerData.displayName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, displayName: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Como quieres que te vean otros usuarios"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Fecha de Nacimiento
                          </label>
                          <input
                            type="date"
                            value={registerData.birthDate}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, birthDate: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Género
                          </label>
                          <select
                            value={registerData.gender}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar</option>
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                            <option value="other">Otro</option>
                            <option value="prefer_not_to_say">Prefiero no decir</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          País
                        </label>
                        <select
                          value={registerData.country}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecciona tu país</option>
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Preferences */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Géneros Favoritos
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {genres.map(genre => (
                            <button
                              key={genre}
                              type="button"
                              onClick={() => handleGenreToggle(genre)}
                              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                registerData.favoriteGenres.includes(genre)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Nivel de Experiencia
                        </label>
                        <div className="space-y-3">
                          {[
                            { value: 'beginner', label: 'Principiante', desc: 'Nuevo en el anime/manga' },
                            { value: 'intermediate', label: 'Intermedio', desc: 'Algo de experiencia' },
                            { value: 'expert', label: 'Experto', desc: 'Otaku experimentado' }
                          ].map(level => (
                            <label key={level.value} className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="experienceLevel"
                                value={level.value}
                                checked={registerData.experienceLevel === level.value}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                              />
                              <div>
                                <div className="text-white font-medium">{level.label}</div>
                                <div className="text-gray-400 text-sm">{level.desc}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Intereses (selecciona los que te interesen)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {interests.map(interest => (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={() => handleInterestToggle(interest.id)}
                              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                registerData.interests.includes(interest.id)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <interest.icon size={20} />
                              <span>{interest.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Terms */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">¡Casi listo!</h3>
                        <p className="text-gray-400">Solo falta aceptar nuestros términos</p>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registerData.agreeToTerms}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <div className="text-gray-300">
                            Acepto los{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300">términos y condiciones</a>
                            {' '}y la{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300">política de privacidad</a>
                          </div>
                        </label>
                        {errors.terms && (
                          <p className="text-red-400 text-sm">{errors.terms}</p>
                        )}

                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registerData.agreeToNewsletter}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, agreeToNewsletter: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <div className="text-gray-300">
                            Quiero recibir noticias y actualizaciones por email
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registerData.agreeToRecommendations}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, agreeToRecommendations: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <div className="text-gray-300">
                            Recibir recomendaciones personalizadas basadas en mis gustos
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
                  <div className="flex space-x-3">
                    {step > 1 && (
                      <button
                        onClick={() => setStep(step - 1)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        <ArrowLeft size={20} />
                        <span>Anterior</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => setMode('login')}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      ¿Ya tienes cuenta?
                    </button>
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? (
                      <Loader className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span>{step === 4 ? 'Crear Cuenta' : 'Siguiente'}</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && (
              <div className="h-full flex flex-col justify-center">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} className="text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Recuperar Contraseña</h2>
                  <p className="text-gray-400">Te enviaremos un enlace para restablecer tu contraseña</p>
                </div>

                <div className="space-y-6">
                  {errors.general && (
                    <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-lg flex items-center space-x-2">
                      <AlertCircle size={16} className="text-red-400" />
                      <span className="text-red-400 text-sm">{errors.general}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                          errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="tu@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <Loader className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span>Enviar Enlace</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => setMode('login')}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      ← Volver al inicio de sesión
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Form */}
            {mode === 'verify' && (
              <div className="h-full flex flex-col justify-center">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} className="text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Verifica tu Email</h2>
                  <p className="text-gray-400">
                    Hemos enviado un código de verificación a<br />
                    <span className="text-white font-medium">{forgotEmail || registerData.email}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código de Verificación
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <button
                    disabled={verificationCode.length !== 6}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Verificar Código
                  </button>

                  <div className="text-center space-y-2">
                    <p className="text-gray-400 text-sm">¿No recibiste el código?</p>
                    <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                      Reenviar código
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterSystem;