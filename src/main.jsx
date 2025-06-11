import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools' // Comentado temporalmente
import { Toaster } from 'sonner'
import App from './App.jsx'
// import { AuthProvider } from './contexts/AuthContext.jsx' // Comentado hasta crear los contextos
// import { ThemeProvider } from './contexts/ThemeContext.jsx'
// import { NotificationProvider } from './contexts/NotificationContext.jsx'
// import { GameProvider } from './contexts/GameContext.jsx'
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
})

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

// Inicialización de la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {/* Contextos comentados temporalmente hasta crearlos */}
        {/* <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <GameProvider> */}
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
                
                {/* React Query DevTools solo en desarrollo - comentado temporalmente */}
                {/* {import.meta.env.DEV && (
                  <ReactQueryDevtools 
                    initialIsOpen={false}
                    position="bottom-right"
                  />
                )} */}
              {/* </GameProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider> */}
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

export { queryClient }