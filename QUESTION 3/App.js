import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './context/AppContext';
import HomeScreen from './screens/HomeScreen';
import ServicesScreen from './screens/ServicesScreen';
import SavedServicesScreen from './screens/SavedServicesScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: 'home-outline',
  Services: 'list-outline',
  Saved: 'bookmark-outline',
};

// Inside the Provider, so the header and tab bar follow the shared Light/Dark preference too.
function ThemedTabs() {
  const { theme, themeMode, savedServices } = useApp();
  const base = themeMode === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.primary,
      background: theme.bg,
      card: theme.card,
      text: theme.text,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
          ),
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.muted,
          // The browser build gives the tab bar no extra room, which clipped the labels.
          ...(Platform.OS === 'web' ? { tabBarStyle: { height: 58, paddingBottom: 6 } } : null),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Services" component={ServicesScreen} />
        <Tab.Screen
          name="Saved"
          component={SavedServicesScreen}
          options={{ tabBarBadge: savedServices.length > 0 ? savedServices.length : undefined }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ThemedTabs />
    </AppProvider>
  );
}
