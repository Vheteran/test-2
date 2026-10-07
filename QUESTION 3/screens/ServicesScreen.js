import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { services } from '../data/services';

export default function ServicesScreen() {
  const { addSavedService, removeSavedService, isSaved, theme, themeMode, toggleTheme } = useApp();

  const renderItem = ({ item }) => {
    const saved = isSaved(item.id);
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          {item.category ? <Text style={{ color: theme.muted }}>{item.category}</Text> : null}
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: saved ? theme.danger : theme.primary }]}
          onPress={() => (saved ? removeSavedService(item.id) : addSavedService(item))}
        >
          <Text style={styles.buttonText}>{saved ? 'Remove' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <TouchableOpacity onPress={toggleTheme} style={styles.themeLink}>
        <Text style={{ color: theme.primary }}>
          Switch to {themeMode === 'light' ? 'Dark' : 'Light'} mode
        </Text>
      </TouchableOpacity>

      <FlatList
        data={services}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  themeLink: { alignSelf: 'flex-end', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { fontSize: 17, fontWeight: '600' },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
