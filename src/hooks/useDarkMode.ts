import { useState, useEffect } from 'react';

export function useDarkMode() {
  // Initialize to false to avoid SSR issues (window/localStorage not available on server)
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = saved !== null ? saved === 'true' : prefersDark;

    setIsDark(initialDark);
  }, []); // Run once on mount

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist to localStorage
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  // Optional: Listen for system theme changes (only if localStorage doesn't override)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('darkMode');
      // Only auto-sync if no manual override in localStorage
      if (saved === null) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Optional: Provide a toggle function for convenience
  const toggleDarkMode = () => setIsDark((prev) => !prev);

  // Return only the public surface the app expects: [isDark, toggleDarkMode]
  return [isDark, toggleDarkMode] as const;
}
