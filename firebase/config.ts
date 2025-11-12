// /firebase/config.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// This flag will determine if we're in "live" mode
export const isFirebaseEnabled = !!firebaseConfig.apiKey;

if (isFirebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Enable offline persistence for Firestore
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('⚠️ Firebase: Multiple tabs open, persistence can only be enabled in one. Offline support may be limited.');
        } else if (err.code === 'unimplemented') {
          console.warn('⚠️ Firebase: The current browser does not support all features required to enable persistence.');
        }
      });

  } catch (error) {
    console.error("🔥 Firebase initialization failed. Check your config.", error);
    // Ensure services are null on failure to prevent downstream errors
    app = null;
    auth = null;
    db = null;
  }
} else {
    console.warn("⚠️ Firebase API key not found. App will run in offline/mock mode.");
}

export { app, auth, db };