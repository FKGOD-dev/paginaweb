import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isDark, setIsDark] = useState(false);

  // Detectar tema del sistema
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Aplicar tema al DOM
  const applyTheme = (themeName) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeName);
    setIsDark(themeName === 'dark');
  };

  // Inicializar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || getSystemTheme();
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Cambiar tema
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};