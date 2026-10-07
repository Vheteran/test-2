import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

export default function SavedServicesScreen() {
  const { savedServices, removeSavedService, theme } = useApp();

  if (savedServices.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.muted, fontSize: 16, textAlign: 'center' }}>
          You have no saved services yet.{'\n'}Save one from the Services screen.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={savedServices}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              {item.category ? <Text style={{ color: theme.muted }}>{item.category}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => removeSavedService(item.id)}>
              <Text style={{ color: theme.danger, fontWeight: '600' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { fontSize: 17, fontWeight: '600' },
});
