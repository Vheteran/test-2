import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseConfigError } from './firebaseConfig';

const friendlyError = (error) => {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const validate = () => {
    if (isRegister && studentName.trim().length === 0) {
      return 'Please enter your display name.';
    }
    if (email.trim().length === 0) return 'Please enter your email.';
    if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email.';
    if (password.length === 0) return 'Please enter your password.';
    if (isRegister && password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return null;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const problem = validate();
    if (problem) {
      setMessage(problem);
      return;
    }

    setMessage('');
    setSubmitting(true);
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          studentName: studentName.trim(),
          email: cred.user.email,
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (e) {
      setMessage(friendlyError(e));
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.kicker}>Question 2</Text>
      <Text style={styles.title}>{isRegister ? 'Create account' : 'Welcome back'}</Text>

      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Display name"
          value={studentName}
          onChangeText={setStudentName}
          editable={!submitting}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        editable={!submitting}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!submitting}
      />

      {message !== '' && <Text style={styles.error}>{message}</Text>}

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isRegister ? 'Register' : 'Log in'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setIsRegister(!isRegister);
          setMessage('');
        }}
        disabled={submitting}
      >
        <Text style={styles.link}>
          {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// Right after registration the profile document may still be on its way.
const MISSING_PROFILE_GRACE_MS = 3000;

function ProfileScreen({ uid }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let graceTimer = null;
    const clearGrace = () => {
      if (graceTimer) clearTimeout(graceTimer);
      graceTimer = null;
    };

    const unsubscribe = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          clearGrace();
          setProfile(snap.data({ serverTimestamps: 'estimate' }));
          setError('');
          setLoading(false);
          return;
        }
        // No document yet: wait briefly (a new registration is still writing it),
        // then stop loading and say so instead of spinning forever.
        setProfile(null);
        if (!graceTimer) {
          graceTimer = setTimeout(() => {
            graceTimer = null;
            setError('No profile document was found for this account.');
            setLoading(false);
          }, MISSING_PROFILE_GRACE_MS);
        }
      },
      (listenerError) => {
        clearGrace();
        setError(
          listenerError?.code === 'permission-denied'
            ? 'Could not load your profile: access denied by the Firestore rules.'
            : 'Could not load your profile.',
        );
        setLoading(false);
      },
    );

    return () => {
      clearGrace();
      unsubscribe();
    };
  }, [uid]);

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut(auth);
    } catch {
      setError('Could not sign out. Please try again.');
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Question 2</Text>
      <Text style={styles.title}>My Profile</Text>

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      {profile && (
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile.studentName}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile.email}</Text>
          <Text style={styles.label}>Member since</Text>
          <Text style={styles.value}>
            {profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : '-'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, signingOut && styles.buttonDisabled]}
        onPress={handleLogout}
        disabled={signingOut}
      >
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

function AuthenticatedApp() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Checking session...</Text>
      </View>
    );
  }

  return user ? <ProfileScreen uid={user.uid} /> : <AuthScreen />;
}

export default function App() {
  if (firebaseConfigError || !auth || !db) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Firebase is not configured</Text>
        <Text style={styles.muted}>{firebaseConfigError}</Text>
      </View>
    );
  }

  return <AuthenticatedApp />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  kicker: {
    color: '#c2410c',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 16 },
  error: { color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  muted: { color: '#666', marginTop: 12, textAlign: 'center' },
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  label: { color: '#666', fontSize: 12, marginTop: 8 },
  value: { fontSize: 18, fontWeight: '500' },
});
