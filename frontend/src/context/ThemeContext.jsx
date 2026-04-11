import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'campus-hub-theme';

const normalizeTheme = (value) => {
  if (value === 'dark' || value === 'night') {
    return 'dark';
  }

  return 'light';
};

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme) {
    return normalizeTheme(savedTheme);
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      setTheme(normalizeTheme(event.newValue));
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
