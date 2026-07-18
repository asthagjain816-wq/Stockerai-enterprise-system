import { create } from 'zustand';

const getSystemTheme = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') || 'light';
  }
  return 'light';
};

const useThemeStore = create((set, get) => {
  // Listen for system theme media query changes
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (get().theme === 'system') {
        set({ isDark: e.matches });
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });
  }

  const initialTheme = getInitialTheme();
  let initialIsDark = false;
  if (initialTheme === 'dark') {
    initialIsDark = true;
  } else if (initialTheme === 'system') {
    initialIsDark = getSystemTheme();
  }

  // Apply class on load
  if (typeof window !== 'undefined') {
    if (initialIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    theme: initialTheme,
    isDark: initialIsDark,
    setTheme: (newTheme) => {
      let darkVal = false;
      if (newTheme === 'dark') {
        darkVal = true;
      } else if (newTheme === 'light') {
        darkVal = false;
      } else if (newTheme === 'system') {
        darkVal = getSystemTheme();
      }
      
      localStorage.setItem('theme', newTheme);
      if (darkVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme: newTheme, isDark: darkVal });
    },
    toggleTheme: () => {
      const current = get().theme;
      const nextTheme = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
      get().setTheme(nextTheme);
    }
  };
});

export default useThemeStore;