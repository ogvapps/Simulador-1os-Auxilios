import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let firebaseConfig;
let appId = 'default-app-id';

try {
  // Check for global variable __firebase_config (can be string or object)
  // @ts-ignore
  if (typeof __firebase_config !== 'undefined') {
    // @ts-ignore
    firebaseConfig = __firebase_config;
  } 
  // Check for window property
  // @ts-ignore
  else if (typeof window !== 'undefined' && window.__firebase_config) {
    // @ts-ignore
    firebaseConfig = window.__firebase_config;
  }

  // If it is a string, parse it
  if (typeof firebaseConfig === 'string') {
    try {
      firebaseConfig = JSON.parse(firebaseConfig);
    } catch (e) {
      console.error('Error parsing firebase config string:', e);
    }
  }

  // Fallback if config is still missing or empty
  if (!firebaseConfig) {
    console.warn('No firebase config found. Using mock config.');
    firebaseConfig = { apiKey: 'mock-key', authDomain: 'mock.firebaseapp.com', projectId: 'mock-project' };
  }

  // Handle appId
  // @ts-ignore
  if (typeof __app_id !== 'undefined') {
      // @ts-ignore
      appId = __app_id;
  // @ts-ignore
  } else if (typeof window !== 'undefined' && window.__app_id) {
      // @ts-ignore
      appId = window.__app_id;
  }
} catch (e) {
  console.error('Error initializing config:', e);
  firebaseConfig = { apiKey: 'mock-key', authDomain: 'mock', projectId: 'mock' };
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, appId };