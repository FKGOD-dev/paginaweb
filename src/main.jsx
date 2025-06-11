import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import { GameProvider } from './contexts/GameContext.jsx'
import './index.css'

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: (failureCount, error) => {
        // No reintentar en errores 404 o 401
        if (error?.status === 404 || error?.status === 401) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error)
      },
    },
  },
})

// Configuración de error boundary global
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Aquí podrías enviar el error a un servicio de logging como Sentry
})

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // Aquí podrías enviar el error a un servicio de logging
})

// Inicialización de la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <GameProvider>
                <App />
                
                {/* Componente de notificaciones toast */}
                <Toaster
                  position="top-right"
                  expand={true}
                  richColors
                  closeButton
                  toastOptions={{
                    duration: 4000,
                    className: 'toast-custom',
                  }}
                />
                
                {/* React Query DevTools solo en desarrollo */}
                {import.meta.env.DEV && (
                  <ReactQueryDevtools 
                    initialIsOpen={false}
                    position="bottom-right"
                  />
                )}
              </GameProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        
        {/* React Query DevTools */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Hot Module Replacement para desarrollo
if (import.meta.hot) {
  import.meta.hot.accept()
}

// Función para limpiar datos obsoletos del localStorage
const cleanupOldData = () => {
  const keys = Object.keys(localStorage)
  const expirationTime = 7 * 24 * 60 * 60 * 1000 // 7 días
  
  keys.forEach(key => {
    if (key.startsWith('manga_cache_') || key.startsWith('anime_cache_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key))
        if (data.timestamp && Date.now() - data.timestamp > expirationTime) {
          localStorage.removeItem(key)
        }
      } catch (error) {
        // Si hay error al parsear, eliminar el item
        localStorage.removeItem(key)
      }
    }
  })
}

// Limpiar datos al cargar la aplicación
cleanupOldData()

// Configuración de analytics (Google Analytics, etc.)
if (import.meta.env.PROD && import.meta.env.VITE_GA_ID) {
  // Inicializar Google Analytics
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`
  document.head.appendChild(script)
  
  window.dataLayer = window.dataLayer || []
  function gtag() {
    dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', import.meta.env.VITE_GA_ID)
  
  window.gtag = gtag
}

// Configuración de tema inicial basado en preferencias del sistema
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (!savedTheme) {
    const initialTheme = systemPrefersDark ? 'dark' : 'light'
    localStorage.setItem('theme', initialTheme)
    document.documentElement.classList.add(initialTheme)
  }
}

initializeTheme()

// Detectar cambios en el tema del sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'system') {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(e.matches ? 'dark' : 'light')
  }
})

// Configuración de notificaciones push (opcional)
if ('Notification' in window && 'serviceWorker' in navigator) {
  // La configuración se manejará en el NotificationContext
}

// Prevenir zoom en dispositivos móviles en inputs
const preventZoom = () => {
  const viewportMeta = document.querySelector('meta[name="viewport"]')
  if (viewportMeta) {
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
  }
}

// Solo en dispositivos móviles
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  preventZoom()
}

export { queryClient }