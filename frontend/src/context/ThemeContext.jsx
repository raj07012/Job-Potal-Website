import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('jp_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    // Fix: pehle attribute set karo, phir localStorage
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme; // iOS Safari ke liye
    try {
      localStorage.setItem('jp_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      // Fix: turant DOM update karo, React re-render ka wait mat karo
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.style.colorScheme = next;
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
