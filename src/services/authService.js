// src/services/authService.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store de autenticación con Zustand
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (credentials) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });
          
          if (!response.ok) throw new Error('Login failed');
          
          const { user, token } = await response.json();
          
          set({ 
            user, 
            token, 
            isAuthenticated: true 
          });
          
          return { success: true, user };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      register: async (userData) => {
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          
          if (!response.ok) throw new Error('Registration failed');
          
          const { user, token } = await response.json();
          
          set({ 
            user, 
            token, 
            isAuthenticated: true 
          });
          
          return { success: true, user };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

// Hook para proteger rutas
export const useRequireAuth = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      // Redirigir a login o mostrar modal
      window.dispatchEvent(new CustomEvent('openAuth'));
    }
  }, [isAuthenticated]);
  
  return { isAuthenticated, user };
};

// Interceptor para agregar token a requests
export const apiClient = {
  get: async (url) => {
    const { token } = useAuthStore.getState();
    const response = await fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },
  
  post: async (url, data) => {
    const { token } = useAuthStore.getState();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};