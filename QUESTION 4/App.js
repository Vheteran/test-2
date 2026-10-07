import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { alerts } from './data/alerts';

export default function App() {
  const [saved, setSaved] = useState([]);

  const toggleSaved = useCallback((id) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id],
    );
  }, []);

  const savedSet = useMemo(() => new Set(saved), [saved]);

  const renderItem = useCallback(
    ({ item }) => <AlertCard item={item} saved={savedSet.has(item.id)} toggleSaved={toggleSaved} />,
    [savedSet, toggleSaved],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Question 4</Text>
      <Text style={styles.heading}>UJ Campus Alert Centre</Text>
      <Text style={styles.count}>Saved alerts: {saved.length}</Text>

      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        extraData={savedSet}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const AlertCard = React.memo(function AlertCard({ item, saved, toggleSaved }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [fade, slide]);

  return (
    <Animated.View
      style={[
        styles.card,
        saved ? styles.cardSaved : styles.cardUnsaved,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      <Text style={[styles.title, saved && styles.titleSaved]}>{item.title}</Text>
      <Pressable
        onPress={() => toggleSaved(item.id)}
        style={[styles.button, saved ? styles.buttonSaved : styles.buttonUnsaved]}
      >
        <Text style={styles.buttonText}>{saved ? 'Saved (tap to remove)' : 'Save alert'}</Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 16, backgroundColor: '#ffffff' },
  kicker: { color: '#c2410c', fontWeight: '700', marginBottom: 4 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  count: { fontSize: 16, color: '#374151', marginBottom: 12 },
  card: { padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1 },
  cardUnsaved: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  cardSaved: { backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: 2 },
  title: { fontSize: 17, fontWeight: '500', marginBottom: 12, color: '#111827' },
  titleSaved: { fontWeight: '700' },
  button: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonUnsaved: { backgroundColor: '#2563eb' },
  buttonSaved: { backgroundColor: '#d97706' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
