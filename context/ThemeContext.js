import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const themes = {
  violet: { name: 'Violet', background: '#12121f', surface: '#1e1e30', card: '#2d1b4e', accent: '#a78bfa', text: '#e0e0e0', textMuted: '#555' },
  midnight: { name: 'Midnight', background: '#0a0a0f', surface: '#141420', card: '#1e1e2e', accent: '#60a5fa', text: '#e0e0e0', textMuted: '#555' },
  forest: { name: 'Forest', background: '#0d1a0f', surface: '#162018', card: '#1e3320', accent: '#4ade80', text: '#e0e0e0', textMuted: '#555' },
  sunset: { name: 'Sunset', background: '#1a0f0a', surface: '#2a1810', card: '#3d2010', accent: '#fb923c', text: '#e0e0e0', textMuted: '#555' },
  rose: { name: 'Rose', background: '#1a0a12', surface: '#28101c', card: '#3d1028', accent: '#f472b6', text: '#e0e0e0', textMuted: '#555' },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('violet');
  const theme = themes[currentTheme];

  useEffect(() => {
    AsyncStorage.getItem('miaup3_theme').then((saved) => {
      if (saved && themes[saved]) setCurrentTheme(saved);
    });
  }, []);

  function changeTheme(name) {
    if (!themes[name]) return;
    setCurrentTheme(name);
    AsyncStorage.setItem('miaup3_theme', name);
  }

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, themes, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
