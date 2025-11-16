import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let firebaseConfig;
let appId = 'default-app-id';
let isMock = false;

/**
 * Helper to retrieve environment variables safely.
 * Supports Vite (import.meta.env.VITE_*) and CRA/Node (process.env.REACT_APP_*).
 */
const getEnvVar = (key: string): string | undefined => {
  const viteKey = `VITE_${key}`;
  const reactKey = `REACT_APP_${key}`;

  // @ts-ignore - Check for Vite
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    // @ts-ignore
    return import.meta.env[viteKey];
  }
  
  // @ts-ignore - Check for process.env (CRA, Webpack, Node)
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    if (process.env[reactKey]) return process.env[reactKey];
    // @ts-ignore
    if (process.env[key]) return process.env[key];
  }

  return undefined;
};

try {
  // 1. Priority: Check Global Injection (useful for runtime config without rebuild)
  // @ts-ignore
  if (typeof window !== 'undefined' && window.__firebase_config) {
    // @ts-ignore
    firebaseConfig = window.__firebase_config;
  }
  // @ts-ignore
  else if (typeof __firebase_config !== 'undefined') {
    // @ts-ignore
    firebaseConfig = __firebase_config;
  }

  // 2. Priority: Check Environment Variables (Build time)
  if (!firebaseConfig || typeof firebaseConfig === 'string') {
    const envConfig = {
      apiKey: getEnvVar('FIREBASE_API_KEY'),
      authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
      projectId: getEnvVar('FIREBASE_PROJECT_ID'),
      storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnvVar('FIREBASE_APP_ID')
    };

    // If at least API Key and Project ID are present, use this config
    if (envConfig.apiKey && envConfig.projectId) {
      firebaseConfig = envConfig;
    }
  }

  // Parse string config if necessary
  if (typeof firebaseConfig === 'string') {
    try {
      firebaseConfig = JSON.parse(firebaseConfig);
    } catch (e) {
      console.error('Error parsing firebase config string:', e);
      firebaseConfig = null;
    }
  }

  // 3. Fallback: Mock Config
  if (!firebaseConfig) {
    console.warn('No valid firebase config found (Env vars or Global). Using mock config.');
    firebaseConfig = { apiKey: 'mock-key', authDomain: 'mock.firebaseapp.com', projectId: 'mock-project' };
    isMock = true;
  }

  // Handle App ID for Artifacts logic
  // @ts-ignore
  if (typeof window !== 'undefined' && window.__app_id) {
      // @ts-ignore
      appId = window.__app_id;
  } else {
      const envAppId = getEnvVar('APP_ID');
      if (envAppId) appId = envAppId;
  }

} catch (e) {
  console.error('Error initializing config:', e);
  firebaseConfig = { apiKey: 'mock-key', authDomain: 'mock', projectId: 'mock' };
  isMock = true;
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, appId, isMock };