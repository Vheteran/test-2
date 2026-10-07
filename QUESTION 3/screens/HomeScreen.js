import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

export default function HomeScreen() {
  const { savedServices, theme, themeMode, toggleTheme } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>UJ Campus Services</Text>

      <View style={[styles.badge, { backgroundColor: theme.primary }]}>
        <Text style={styles.badgeText}>Saved Services: {savedServices.length}</Text>
      </View>

      <TouchableOpacity
        style={[styles.toggle, { backgroundColor: theme.card }]}
        onPress={toggleTheme}
      >
        <Text style={{ color: theme.text }}>
          Theme: {themeMode === 'light' ? 'Light' : 'Dark'} (tap to switch)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 24 },
  badge: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24, marginBottom: 24 },
  badgeText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  toggle: { padding: 14, borderRadius: 10 },
});
