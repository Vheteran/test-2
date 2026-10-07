import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PRIORITIES } from '../constants';

export default function TaskForm({ onCreate, disabled }) {
  const [title, setTitle] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [validationMessage, setValidationMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    const trimmedModuleCode = moduleCode.trim();
    const missingTitle = trimmedTitle.length === 0;
    const missingModuleCode = trimmedModuleCode.length === 0;

    if (missingTitle || missingModuleCode) {
      if (missingTitle && missingModuleCode) {
        setValidationMessage('Enter a task title and a module code.');
      } else if (missingTitle) {
        setValidationMessage('Enter a task title.');
      } else {
        setValidationMessage('Enter a module code.');
      }
      return;
    }

    if (!PRIORITIES.includes(priority)) {
      setValidationMessage('Choose a priority of Low, Medium, or High.');
      return;
    }

    setValidationMessage('');
    setIsSaving(true);

    try {
      const saved = await onCreate({
        title: trimmedTitle,
        moduleCode: trimmedModuleCode,
        priority,
      });

      if (saved) {
        setTitle('');
        setModuleCode('');
        setPriority('Medium');
      }
    } finally {
      setIsSaving(false);
    }
  }

  const formLocked = disabled || isSaving;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Add a task</Text>
      <Text style={styles.hint}>Title, module code, and priority are saved to Firestore.</Text>

      <Text style={styles.label}>Task title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Prepare for the practical"
        placeholderTextColor="#8A94A3"
        style={styles.input}
        editable={!formLocked}
        autoCapitalize="sentences"
        returnKeyType="next"
      />

      <Text style={styles.label}>Module code</Text>
      <TextInput
        value={moduleCode}
        onChangeText={setModuleCode}
        placeholder="DSW02B1"
        placeholderTextColor="#8A94A3"
        style={styles.input}
        editable={!formLocked}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="done"
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((option) => {
          const selected = priority === option;
          return (
            <Pressable
              key={option}
              onPress={() => setPriority(option)}
              disabled={formLocked}
              style={[styles.priorityOption, selected && styles.priorityOptionSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.priorityText, selected && styles.priorityTextSelected]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={formLocked}
        style={({ pressed }) => [
          styles.submit,
          formLocked && styles.submitDisabled,
          pressed && !formLocked && styles.submitPressed,
        ]}
        accessibilityRole="button"
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>Add task</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E9F0',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172033',
  },
  hint: {
    marginTop: 4,
    marginBottom: 12,
    color: '#5E6A7A',
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5DDE7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#172033',
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  priorityOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D5DDE7',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  priorityOptionSelected: {
    backgroundColor: '#10243E',
    borderColor: '#10243E',
  },
  priorityText: {
    fontWeight: '600',
    color: '#334155',
  },
  priorityTextSelected: {
    color: '#FFFFFF',
  },
  validation: {
    color: '#9F1239',
    backgroundColor: '#FFF1F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  submit: {
    backgroundColor: '#C2410C',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPressed: {
    backgroundColor: '#9A3412',
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
