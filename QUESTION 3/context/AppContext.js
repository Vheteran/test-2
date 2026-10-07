import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_KEY = '@ujCampusServices/savedServices';
const THEME_KEY = '@ujCampusServices/themePreference';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export const THEMES = {
  light: {
    bg: '#ffffff',
    card: '#f3f4f6',
    text: '#111827',
    muted: '#6b7280',
    primary: '#2563eb',
    danger: '#dc2626',
  },
  dark: {
    bg: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    muted: '#9ca3af',
    primary: '#60a5fa',
    danger: '#f87171',
  },
};

export function AppProvider({ children }) {
  const [savedServices, setSavedServices] = useState([]);
  const [themeMode, setThemeMode] = useState('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restore = async () => {
      try {
        const [rawSaved, rawTheme] = await Promise.all([
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(THEME_KEY),
        ]);

        if (rawSaved !== null) {
          const parsed = JSON.parse(rawSaved);
          if (Array.isArray(parsed)) setSavedServices(parsed);
        }
        if (rawTheme === 'light' || rawTheme === 'dark') setThemeMode(rawTheme);
      } catch (e) {
        console.warn('Failed to restore app state:', e);
      } finally {
        setHydrated(true);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const persist = async () => {
      try {
        await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(savedServices));
      } catch (e) {
        console.warn('Failed to save services:', e);
      }
    };
    persist();
  }, [savedServices, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const persist = async () => {
      try {
        await AsyncStorage.setItem(THEME_KEY, themeMode);
      } catch (e) {
        console.warn('Failed to save preference:', e);
      }
    };
    persist();
  }, [themeMode, hydrated]);

  const addSavedService = useCallback((service) => {
    setSavedServices((prev) =>
      prev.some((item) => item.id === service.id) ? prev : [...prev, service],
    );
  }, []);

  const removeSavedService = useCallback((serviceId) => {
    setSavedServices((prev) => prev.filter((item) => item.id !== serviceId));
  }, []);

  const isSaved = useCallback(
    (serviceId) => savedServices.some((item) => item.id === serviceId),
    [savedServices],
  );

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      savedServices,
      addSavedService,
      removeSavedService,
      isSaved,
      themeMode,
      toggleTheme,
      theme: THEMES[themeMode],
    }),
    [savedServices, addSavedService, removeSavedService, isSaved, themeMode, toggleTheme],
  );

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
