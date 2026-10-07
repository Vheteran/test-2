import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, firebaseConfigError } from '../../../firebaseConfig';
import { TASKS_COLLECTION } from '../constants';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

function sortTasks(tasks) {
  return [...tasks].sort((left, right) => {
    const leftTime = left.createdAt?.toMillis?.() ?? 0;
    const rightTime = right.createdAt?.toMillis?.() ?? 0;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return String(right.id).localeCompare(String(left.id));
  });
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listenerError, setListenerError] = useState('');
  const [writeError, setWriteError] = useState('');
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [listenerVersion, setListenerVersion] = useState(0);

  useEffect(() => {
    if (firebaseConfigError || !db) {
      setListenerError(firebaseConfigError || 'Firestore is unavailable.');
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, TASKS_COLLECTION),
      (snapshot) => {
        const cloudTasks = snapshot.docs.map((taskDocument) => {
          // 'estimate' gives a just-added task a local time until the server
          // timestamp arrives, so it sorts to the top straight away.
          const data = taskDocument.data({ serverTimestamps: 'estimate' });

          return {
            id: taskDocument.id,
            title: data.title ?? '',
            moduleCode: data.moduleCode ?? '',
            priority: data.priority ?? 'Low',
            completed: data.completed === true,
            createdAt: data.createdAt ?? null,
          };
        });

        setTasks(cloudTasks);
        setListenerError('');
        setLoading(false);
      },
      (error) => {
        setListenerError(error?.message || 'Could not load tasks from Firestore.');
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [listenerVersion]);

  const visibleTasks = useMemo(() => sortTasks(tasks), [tasks]);

  function markPending(taskId, isPending) {
    setPendingIds((current) => {
      const next = new Set(current);
      if (isPending) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  }

  async function handleCreate({ title, moduleCode, priority }) {
    if (!db) {
      setWriteError(firebaseConfigError || 'Firestore is unavailable.');
      return false;
    }

    setWriteError('');

    try {
      await addDoc(collection(db, TASKS_COLLECTION), {
        title,
        moduleCode,
        priority,
        completed: false,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      setWriteError(error?.message || 'Could not save the new task.');
      return false;
    }
  }

  async function handleToggleComplete(task) {
    if (!db || !task?.id || pendingIds.has(task.id)) {
      return;
    }

    markPending(task.id, true);
    setWriteError('');

    try {
      await updateDoc(doc(db, TASKS_COLLECTION, task.id), {
        completed: task.completed !== true,
      });
    } catch (error) {
      setWriteError(error?.message || 'Could not update this task.');
    } finally {
      markPending(task.id, false);
    }
  }

  function handleDelete(task) {
    if (!db || !task?.id || pendingIds.has(task.id)) {
      return;
    }

    // Alert.alert has no buttons on web, so the browser build uses confirm().
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`Delete "${task.title}" from Firestore?`)) {
        removeTask(task.id);
      }
      return;
    }

    Alert.alert(
      'Delete task',
      `Delete "${task.title}" from Firestore?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeTask(task.id);
          },
        },
      ],
    );
  }

  async function removeTask(taskId) {
    markPending(taskId, true);
    setWriteError('');

    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    } catch (error) {
      setWriteError(error?.message || 'Could not delete this task.');
    } finally {
      markPending(taskId, false);
    }
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topSection}>
          <View style={styles.header}>
            <Text style={styles.kicker}>{'DSW02B1 \u00B7 Question 1'}</Text>
            <Text style={styles.title}>Academic tasks</Text>
            <Text style={styles.subtitle}>Live Firestore list for the tasks collection.</Text>
          </View>

          {listenerError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Could not reach Firestore</Text>
              <Text style={styles.errorBody}>{listenerError}</Text>
              <Pressable
                onPress={() => setListenerVersion((version) => version + 1)}
                style={styles.retryButton}
                accessibilityRole="button"
              >
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : null}

          {writeError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>The last change was not saved</Text>
              <Text style={styles.errorBody}>{writeError}</Text>
            </View>
          ) : null}

          <TaskForm onCreate={handleCreate} disabled={Boolean(firebaseConfigError)} />
          <Text style={styles.sectionLabel}>Tasks</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#10243E" />
            <Text style={styles.loadingText}>Loading tasks from Firestore...</Text>
          </View>
        ) : (
          <TaskList
            tasks={visibleTasks}
            pendingIds={pendingIds}
            showEmpty={!listenerError}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F5F8',
  },
  topSection: {
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  kicker: {
    color: '#C2410C',
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: '800',
    color: '#10243E',
  },
  subtitle: {
    marginTop: 4,
    color: '#5E6A7A',
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E9F0',
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 10,
    color: '#334155',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 12,
    marginBottom: 12,
  },
  errorTitle: {
    color: '#9F1239',
    fontWeight: '700',
    marginBottom: 4,
  },
  errorBody: {
    color: '#881337',
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#9F1239',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
