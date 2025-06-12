// src/components/admin/AdminDashboardSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Play, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Star,
  Award,
  Clock,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Activity,
  Zap,
  Crown,
  Shield,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Target,
  DollarSign,
  PieChart,
  LineChart,
  Database,
  Server,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AdminDashboardSystem = ({ currentUser, darkMode = true }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d'); // 24h, 7d, 30d, 90d, 1y
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState(true);

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 156789,
      activeUsers: 89456,
      newUsersToday: 1247,
      totalContent: 45623,
      dailyViews: 2456789,
      totalReviews: 78945,
      userGrowth: 12.5,
      engagementRate: 68.2,
      avgSessionTime: '24m 32s',
      bounceRate: 23.4
    },
    userMetrics: {
      registrations: {
        today: 1247,
        yesterday: 1089,
        thisWeek: 8765,
        lastWeek: 7234,
        growth: 21.2
      },
      engagement: {
        dailyActive: 89456,
        weeklyActive: 234567,
        monthlyActive: 567890,
        retention: 85.6
      },
      demographics: {
        ageGroups: [
          { range: '13-17', count: 45623, percentage: 29.1 },
          { range: '18-24', count: 62341, percentage: 39.8 },
          { range: '25-34', count: 32156, percentage: 20.5 },
          { range: '35+', count: 16669, percentage: 10.6 }
        ],
        countries: [
          { name: 'España', count: 34567, flag: '🇪🇸' },
          { name: 'México', count: 28934, flag: '🇲🇽' },
          { name: 'Argentina', count: 23456, flag: '🇦🇷' },
          { name: 'Colombia', count: 19876, flag: '🇨🇴' },
          { name: 'Chile', count: 15432, flag: '🇨🇱' }
        ]
      }
    },
    contentMetrics: {
      anime: {
        total: 23456,
        viewed: 2345678,
        rated: 456789,
        favorited: 123456,
        topGenres: ['Action', 'Romance', 'Comedy', 'Drama', 'Fantasy']
      },
      manga: {
        total: 22167,
        read: 1876543,
        chapters: 345678,
        bookmarked: 98765,
        topGenres: ['Romance', 'Action', 'Comedy', 'Slice of Life', 'Drama']
      },
      reviews: {
        total: 78945,
        thisMonth: 12456,
        avgRating: 7.8,
        moderated: 234,
        reported: 45
      }
    },
    systemMetrics: {
      server: {
        cpu: 45.2,
        memory: 68.7,
        disk: 34.1,
        network: 156.7, // MB/s
        uptime: '99.97%'
      },
      performance: {
        avgResponseTime: 234, // ms
        errorRate: 0.02, // %
        throughput: 2456, // requests/min
        cacheHitRate: 94.5 // %
      },
      database: {
        connections: 234,
        queries: 45678,
        slowQueries: 12,
        storage: 2.3 // TB
      }
    },
    financialMetrics: {
      revenue: {
        today: 2456.78,
        thisMonth: 67890.12,
        lastMonth: 65432.10,
        growth: 3.8
      },
      subscriptions: {
        premium: 23456,
        free: 133333,
        conversionRate: 14.9,
        churnRate: 2.3
      }
    }
  });

  const timeRanges = [
    { value: '24h', label: 'Últimas 24h' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: '1y', label: 'Último año' }
  ];

  const metricCategories = [
    { id: 'overview', label: 'Resumen General', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'content', label: 'Contenido', icon: Play },
    { id: 'engagement', label: 'Engagement', icon: Heart },
    { id: 'system', label: 'Sistema', icon: Server },
    { id: 'financial', label: 'Financiero', icon: DollarSign }
  ];

  useEffect(() => {
    // Simulate real-time updates
    if (realTimeData) {
      const interval = setInterval(() => {
        setAnalyticsData(prev => ({
          ...prev,
          overview: {
            ...prev.overview,
            dailyViews: prev.overview.dailyViews + Math.floor(Math.random() * 100),
            activeUsers: prev.overview.activeUsers + Math.floor(Math.random() * 10) - 5
          }
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [realTimeData]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-400';
    if (growth < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp size={16} />;
    if (growth < 0) return <TrendingDown size={16} />;
    return <ArrowRight size={16} />;
  };

  const renderOverviewMetrics = () => (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Usuarios Totales',
            value: formatNumber(analyticsData.overview.totalUsers),
            growth: analyticsData.overview.userGrowth,
            icon: Users,
            color: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Usuarios Activos',
            value: formatNumber(analyticsData.overview.activeUsers),
            growth: 8.3,
            icon: Activity,
            color: 'from-green-500 to-green-600'
          },
          {
            title: 'Vistas Diarias',
            value: formatNumber(analyticsData.overview.dailyViews),
            growth: 15.7,
            icon: Eye,
            color: 'from-purple-500 to-purple-600'
          },
          {
            title: 'Engagement',
            value: `${analyticsData.overview.engagementRate}%`,
            growth: -2.1,
            icon: Heart,
            color: 'from-orange-500 to-orange-600'
          }
        ].map((metric, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                <metric.icon size={24} className="text-white" />
              </div>
              <div className={`flex items-center space-x-1 ${getGrowthColor(metric.growth)}`}>
                {getGrowthIcon(metric.growth)}
                <span className="text-sm font-medium">
                  {metric.growth > 0 ? '+' : ''}{metric.growth}%
                </span>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{metric.title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Crecimiento de Usuarios</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400 text-sm">Nuevos usuarios</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[45, 67, 89, 56, 78, 92, 84, 76, 95, 87, 93, 98, 102, 89].map((height, index) => (
              <div key={index} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
            ))}
          </div>
        </div>

        {/* Content Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Distribución de Contenido</h3>
          <div className="space-y-4">
            {[
              { label: 'Anime', value: 52.3, color: 'bg-blue-500' },
              { label: 'Manga', value: 31.2, color: 'bg-green-500' },
              { label: 'Reviews', value: 12.8, color: 'bg-purple-500' },
              { label: 'Listas', value: 3.7, color: 'bg-orange-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-gray-400 text-sm">{item.label}</div>
                <div className="flex-1 bg-gray-700 rounded-full h-3">
                  <div 
                    className={`${item.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
                <div className="w-12 text-white text-sm font-medium">{item.value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6">Actividad Reciente</h3>
        <div className="space-y-4">
          {[
            { type: 'user', message: '1,247 nuevos usuarios registrados hoy', time: 'Hace 5 min', icon: Users, color: 'text-blue-400' },
            { type: 'content', message: 'Nuevo anime "Attack on Titan" agregado', time: 'Hace 12 min', icon: Play, color: 'text-green-400' },
            { type: 'review', message: '89 nuevas reseñas publicadas', time: 'Hace 25 min', icon: Star, color: 'text-yellow-400' },
            { type: 'system', message: 'Backup automático completado', time: 'Hace 1 hora', icon: Database, color: 'text-purple-400' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
              <div className={`w-8 h-8 ${activity.color} bg-gray-600 rounded-full flex items-center justify-center`}>
                <activity.icon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.message}</p>
                <p className="text-gray-400 text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUserMetrics = () => (
    <div className="space-y-8">
      {/* User Registration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Registros Hoy', value: analyticsData.userMetrics.registrations.today, change: '+12.5%' },
          { title: 'Esta Semana', value: analyticsData.userMetrics.registrations.thisWeek, change: '+8.3%' },
          { title: 'Tasa de Crecimiento', value: `${analyticsData.userMetrics.registrations.growth}%`, change: '+2.1%' }
        ].map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-white mt-2">{formatNumber(stat.value)}</p>
            <p className="text-green-400 text-sm mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Age Groups */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Distribución por Edad</h3>
          <div className="space-y-4">
            {analyticsData.userMetrics.demographics.ageGroups.map((group, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300">{group.range} años</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-white text-sm w-12">{group.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Países Principales</h3>
          <div className="space-y-4">
            {analyticsData.userMetrics.demographics.countries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-gray-300">{country.name}</span>
                </div>
                <span className="text-white font-medium">{formatNumber(country.count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6">Métricas de Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Usuarios Activos Diarios', value: formatNumber(analyticsData.userMetrics.engagement.dailyActive), icon: Activity },
            { label: 'Usuarios Activos Semanales', value: formatNumber(analyticsData.userMetrics.engagement.weeklyActive), icon: Calendar },
            { label: 'Usuarios Activos Mensuales', value: formatNumber(analyticsData.userMetrics.engagement.monthlyActive), icon: TrendingUp },
            { label: 'Tasa de Retención', value: `${analyticsData.userMetrics.engagement.retention}%`, icon: Target }
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <metric.icon size={32} className="text-blue-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-gray-400 text-sm mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemMetrics = () => (
    <div className="space-y-8">
      {/* Server Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'CPU', value: analyticsData.systemMetrics.server.cpu, unit: '%', color: 'bg-blue-500', max: 100 },
          { label: 'Memoria', value: analyticsData.systemMetrics.server.memory, unit: '%', color: 'bg-green-500', max: 100 },
          { label: 'Disco', value: analyticsData.systemMetrics.server.disk, unit: '%', color: 'bg-yellow-500', max: 100 },
          { label: 'Red', value: analyticsData.systemMetrics.server.network, unit: 'MB/s', color: 'bg-purple-500', max: 200 }
        ].map((metric, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">{metric.label}</h3>
              <span className="text-white font-bold">{metric.value}{metric.unit}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`${metric.color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${(metric.value / metric.max) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Rendimiento</h3>
          <div className="space-y-4">
            {[
              { label: 'Tiempo de Respuesta Promedio', value: `${analyticsData.systemMetrics.performance.avgResponseTime}ms`, status: 'good' },
              { label: 'Tasa de Error', value: `${analyticsData.systemMetrics.performance.errorRate}%`, status: 'excellent' },
              { label: 'Throughput', value: `${formatNumber(analyticsData.systemMetrics.performance.throughput)} req/min`, status: 'good' },
              { label: 'Cache Hit Rate', value: `${analyticsData.systemMetrics.performance.cacheHitRate}%`, status: 'excellent' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{item.value}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'excellent' ? 'bg-green-400' :
                    item.status === 'good' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Base de Datos</h3>
          <div className="space-y-4">
            {[
              { label: 'Conexiones Activas', value: analyticsData.systemMetrics.database.connections, icon: Database },
              { label: 'Consultas/min', value: formatNumber(analyticsData.systemMetrics.database.queries), icon: Activity },
              { label: 'Consultas Lentas', value: analyticsData.systemMetrics.database.slowQueries, icon: Clock },
              { label: 'Almacenamiento', value: `${analyticsData.systemMetrics.database.storage} TB`, icon: Server }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                <item.icon size={20} className="text-blue-400" />
                <div className="flex-1">
                  <span className="text-gray-300">{item.label}</span>
                </div>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { service: 'API Gateway', status: 'online', uptime: '99.97%', icon: Globe },
            { service: 'Base de Datos', status: 'online', uptime: '99.99%', icon: Database },
            { service: 'CDN', status: 'online', uptime: '99.95%', icon: Zap },
            { service: 'Servidor de Archivos', status: 'online', uptime: '99.98%', icon: Server },
            { service: 'Sistema de Notificaciones', status: 'maintenance', uptime: '99.89%', icon: Bell },
            { service: 'Sistema de Búsqueda', status: 'online', uptime: '99.94%', icon: Search }
          ].map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <service.icon size={20} className="text-gray-400" />
                <div>
                  <p className="text-white font-medium">{service.service}</p>
                  <p className="text-gray-400 text-sm">Uptime: {service.uptime}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-2 ${
                service.status === 'online' ? 'text-green-400' :
                service.status === 'maintenance' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  service.status === 'online' ? 'bg-green-400' :
                  service.status === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-sm font-medium capitalize">{service.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard de Administración</h1>
            <p className="text-gray-400 mt-1">Panel de control y métricas de AnimeVerse</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Real-time toggle */}
            <button
              onClick={() => setRealTimeData(!realTimeData)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                realTimeData 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Activity size={16} />
              <span>{realTimeData ? 'Tiempo Real: ON' : 'Tiempo Real: OFF'}</span>
            </button>

            {/* Time range selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Refresh button */}
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
              }}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg overflow-x-auto">
          {metricCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedMetric(category.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                selectedMetric === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <category.icon size={20} />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {selectedMetric === 'overview' && renderOverviewMetrics()}
          {selectedMetric === 'users' && renderUserMetrics()}
          {selectedMetric === 'system' && renderSystemMetrics()}
          
          {/* Placeholder for other metrics */}
          {!['overview', 'users', 'system'].includes(selectedMetric) && (
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                {metricCategories.find(c => c.id === selectedMetric)?.icon && (
                  React.createElement(metricCategories.find(c => c.id === selectedMetric).icon, { size: 32, className: "text-gray-400" })
                )}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {metricCategories.find(c => c.id === selectedMetric)?.label}
              </h3>
              <p className="text-gray-400">
                Las métricas de {metricCategories.find(c => c.id === selectedMetric)?.label.toLowerCase()} se mostrarán aquí próximamente.
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Última actualización: {new Date().toLocaleTimeString()}</span>
              <span>•</span>
              <span>Servidor: {analyticsData.systemMetrics.server.uptime} uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Sistema Operativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSystem;