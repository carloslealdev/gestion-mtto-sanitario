import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

const REQUIRED_ENV_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const

const missingEnv = REQUIRED_ENV_VARS.filter((key) => !import.meta.env[key])
if (missingEnv.length > 0) {
  const message = `Faltan variables de entorno: ${missingEnv.join(", ")}. Copiá .env.template a .env y completá la configuración de Firebase.`
  const root = document.getElementById("root")
  if (root) {
    root.innerHTML = `<div style="font-family: sans-serif; padding: 2rem; max-width: 40rem; margin: 0 auto;"><h1 style="font-size: 1.25rem;">Error de configuración</h1><p>${message}</p></div>`
  }
  throw new Error(message)
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Optional: enables Firebase Analytics error reporting (see src/lib/monitoring.ts).
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {}),
}

const app = initializeApp(firebaseConfig)

export { app };

export const auth = getAuth(app)
export const db = getFirestore(app)
export const FIREBASE_API_KEY = firebaseConfig.apiKey

const useEmulators = import.meta.env.VITE_USE_EMULATORS === "true"
if (useEmulators) {
  connectAuthEmulator(auth, "http://localhost:9099")
  connectFirestoreEmulator(db, "localhost", 8080)
}
