import { create } from 'zustand';
import { translations } from '../services/translation';

const useLanguageStore = create((set, get) => ({
  language: localStorage.getItem('language') || 'English',
  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language });
  },
  t: (key) => {
    const lang = get().language;
    const dictionary = translations[lang] || translations['English'];
    return dictionary[key] || translations['English'][key] || key;
  }
}));

export default useLanguageStore;
