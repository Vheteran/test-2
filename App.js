import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Question1 from './QUESTION 1/src/screens/TasksScreen';
import Question2 from './QUESTION 2/App';
import Question3 from './QUESTION 3/App';
import Question4 from './QUESTION 4/App';

const QUESTIONS = [
  {
    id: 1,
    title: 'Question 1',
    detail: 'Real-time academic tasks in Firestore',
  },
  {
    id: 2,
    title: 'Question 2',
    detail: 'Firebase login, profile, and logout',
  },
  {
    id: 3,
    title: 'Question 3',
    detail: 'Saved campus services and theme',
  },
  {
    id: 4,
    title: 'Question 4',
    detail: 'Campus alerts, state, and animation',
  },
];

function QuestionMenu({ onOpen }) {
  return (
    <SafeAreaView style={styles.menuScreen}>
      <Text style={styles.course}>{'DSW02B1 \u00B7 Test 2'}</Text>
      <Text style={styles.menuTitle}>Test 2 revision</Text>
      {QUESTIONS.map((question) => (
        <Pressable
          key={question.id}
          onPress={() => onOpen(question.id)}
          accessibilityRole="button"
          accessibilityLabel={question.title}
          style={({ pressed }) => [styles.menuCard, pressed && styles.menuCardPressed]}
        >
          <Text style={styles.menuCardTitle}>{question.title}</Text>
          <Text style={styles.menuCardDetail}>{question.detail}</Text>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}

function QuestionFrame({ onBack, children }) {
  return (
    <SafeAreaView style={styles.frame} edges={['top', 'left', 'right']}>
      <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button">
        <Text style={styles.backText}>{'\u2190 All questions'}</Text>
      </Pressable>
      <View style={styles.frameBody}>{children}</View>
    </SafeAreaView>
  );
}

export default function App() {
  const [question, setQuestion] = useState(null);

  let screen = null;
  if (question === 1) screen = <Question1 />;
  if (question === 2) screen = <Question2 />;
  if (question === 3) screen = <Question3 />;
  if (question === 4) screen = <Question4 />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen ? (
        <QuestionFrame onBack={() => setQuestion(null)}>{screen}</QuestionFrame>
      ) : (
        <QuestionMenu onOpen={setQuestion} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  menuScreen: {
    flex: 1,
    backgroundColor: '#F3F5F8',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  course: {
    color: '#C2410C',
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  menuTitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 32,
    fontWeight: '800',
    color: '#10243E',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E9F0',
  },
  menuCardPressed: {
    opacity: 0.8,
  },
  menuCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10243E',
  },
  menuCardDetail: {
    marginTop: 4,
    color: '#5E6A7A',
    fontSize: 15,
  },
  frame: {
    flex: 1,
    backgroundColor: '#F3F5F8',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    color: '#1D4E89',
    fontWeight: '700',
    fontSize: 15,
  },
  frameBody: {
    flex: 1,
  },
});
