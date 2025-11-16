import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Interfaces para tipado básico
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

let firebaseConfig: FirebaseConfig | null = null;
let appId = 'default-app-id';
let isMock = false;

/**
 * Helper para recuperar variables de entorno de forma segura.
 * Soporta Vite (import.meta.env.VITE_*) y Create React App/Node (process.env.REACT_APP_*).
 */
const getEnvVar = (key: string): string | undefined => {
  const viteKey = `VITE_${key}`;
  const reactKey = `REACT_APP_${key}`;

  // 1. Intentar Vite (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
      // @ts-ignore
      return import.meta.env[viteKey];
    }
  } catch (e) {
    // Ignorar error si import.meta no existe
  }
  
  // 2. Intentar process.env (CRA, Webpack, Node)
  try {
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      if (process.env[reactKey]) return process.env[reactKey];
      // @ts-ignore
      if (process.env[key]) return process.env[key];
    }
  } catch (e) {
    // Ignorar error si process no existe
  }

  return undefined;
};

// Lógica de Inicialización
try {
  // A. Prioridad 1: Configuración inyectada en Runtime (window)
  // Útil para despliegues estáticos donde no se quiere recompilar para cambiar credenciales (ej. config.js en index.html)
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

  // B. Prioridad 2: Variables de Entorno (Build time)
  if (!firebaseConfig) {
    const apiKey = getEnvVar('FIREBASE_API_KEY');
    const projectId = getEnvVar('FIREBASE_PROJECT_ID');

    if (apiKey && projectId) {
      firebaseConfig = {
        apiKey: apiKey,
        authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN') || '',
        projectId: projectId,
        storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvVar('FIREBASE_APP_ID')
      };
    }
  }

  // Manejo del App ID personalizado para la lógica de artefactos
  // @ts-ignore
  if (typeof window !== 'undefined' && window.__app_id) {
      // @ts-ignore
      appId = window.__app_id;
  } else {
      const envAppId = getEnvVar('APP_ID');
      if (envAppId) appId = envAppId;
  }

  // Validación final de la configuración
  if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey === 'mock-key') {
    throw new Error("Configuración inválida o incompleta");
  }

} catch (e) {
  console.warn('⚠️ Firebase no configurado correctamente o variables no encontradas.');
  console.warn('ℹ️ Iniciando en MODO MOCK (Offline).');
  
  firebaseConfig = { 
    apiKey: 'mock-key', 
    authDomain: 'mock.firebaseapp.com', 
    projectId: 'mock-project' 
  };
  isMock = true;
}

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, appId, isMock };