import { FlatList, StyleSheet, Text, View } from 'react-native';
import TaskCard from './TaskCard';

function EmptyTasks() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No tasks yet</Text>
      <Text style={styles.emptyBody}>
        The tasks collection is empty. Add an academic task and it will appear here automatically.
      </Text>
    </View>
  );
}

export default function TaskList({
  tasks,
  pendingIds,
  showEmpty,
  onToggleComplete,
  onDelete,
}) {
  return (
    <FlatList
      style={styles.list}
      data={tasks}
      extraData={pendingIds}
      keyExtractor={(task) => task.id}
      renderItem={({ item }) => (
        <TaskCard
          task={item}
          isBusy={pendingIds.has(item.id)}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        />
      )}
      ListEmptyComponent={showEmpty ? <EmptyTasks /> : null}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  empty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E9F0',
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#172033',
    marginBottom: 6,
  },
  emptyBody: {
    textAlign: 'center',
    color: '#5E6A7A',
    lineHeight: 20,
  },
});
