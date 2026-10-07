import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { PRIORITY_COLORS } from '../constants';

function formatCreatedAt(createdAt) {
  if (!createdAt || typeof createdAt.toDate !== 'function') {
    return 'Waiting for server time';
  }

  return createdAt.toDate().toLocaleString();
}

export default function TaskCard({ task, isBusy, onToggleComplete, onDelete }) {
  const completed = task.completed === true;
  const priorityStyle = PRIORITY_COLORS[task.priority] ?? {
    text: '#334155',
    surface: '#F1F5F9',
  };

  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, completed && styles.titleCompleted]}>{task.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.surface }]}>
          <Text style={[styles.priorityText, { color: priorityStyle.text }]}>{task.priority}</Text>
        </View>
      </View>

      <Text style={styles.moduleCode}>{task.moduleCode}</Text>

      <View style={styles.metaRow}>
        <View style={[styles.statusBadge, completed ? styles.statusComplete : styles.statusIncomplete]}>
          <Text style={[styles.statusText, completed ? styles.statusTextComplete : styles.statusTextIncomplete]}>
            {completed ? 'Completed' : 'Incomplete'}
          </Text>
        </View>
        <Text style={styles.timestamp}>{formatCreatedAt(task.createdAt)}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => onToggleComplete(task)}
          disabled={isBusy}
          style={({ pressed }) => [
            styles.actionButton,
            styles.toggleButton,
            pressed && !isBusy && styles.pressed,
            isBusy && styles.disabled,
          ]}
          accessibilityRole="button"
        >
          {isBusy ? (
            <ActivityIndicator color="#10243E" />
          ) : (
            <Text style={styles.toggleText}>
              {completed ? 'Mark incomplete' : 'Mark complete'}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => onDelete(task)}
          disabled={isBusy}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteButton,
            pressed && !isBusy && styles.pressed,
            isBusy && styles.disabled,
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E9F0',
    borderLeftWidth: 5,
    borderLeftColor: '#1D4E89',
  },
  cardCompleted: {
    backgroundColor: '#F7FBF8',
    borderLeftColor: '#166534',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#172033',
  },
  titleCompleted: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  priorityBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  moduleCode: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    letterSpacing: 0.3,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusComplete: {
    backgroundColor: '#DCFCE7',
  },
  statusIncomplete: {
    backgroundColor: '#E8F1FB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextComplete: {
    color: '#166534',
  },
  statusTextIncomplete: {
    color: '#1D4E89',
  },
  timestamp: {
    flex: 1,
    textAlign: 'right',
    color: '#64748B',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  toggleButton: {
    backgroundColor: '#E8EEF6',
  },
  deleteButton: {
    backgroundColor: '#FFF1F2',
    flex: 0.6,
  },
  toggleText: {
    color: '#10243E',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteText: {
    color: '#9F1239',
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.6,
  },
});
