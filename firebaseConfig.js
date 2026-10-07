import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCUFEOFQ6gaWtlhKAvSPW5bpVKOSGflorg',
  authDomain: 'test-2-a9b6a.firebaseapp.com',
  projectId: 'test-2-a9b6a',
  storageBucket: 'test-2-a9b6a.firebasestorage.app',
  messagingSenderId: '1012692192097',
  appId: '1:1012692192097:web:f667cd30bf804491b25320',
};

// Screens import this to show a clear message instead of crashing
// if a config value is ever missing. null means the config is complete.
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseConfigError = missingKeys.length
  ? `Firebase config is missing: ${missingKeys.join(', ')}`
  : null;

const app = initializeApp(firebaseConfig);

// Phone and Expo Go keep the login after a restart.
// The browser build of Firebase does not include that helper, so web uses its own session.
export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });

export const db = getFirestore(app);
