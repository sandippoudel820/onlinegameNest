import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  // Built-in Firebase configuration for braided-field-wgmzr
  const firebaseConfig = {
    projectId: "braided-field-wgmzr",
    appId: "1:988621309224:web:d36a4dd68c04ddfec4fc1d",
    apiKey: "AIzaSyD4jusojsh5WD_z5FSRUmKI_lfXKZe3kCg",
    authDomain: "braided-field-wgmzr.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-gamenestplayfree-286d6787-56dc-4c8c-99f2-253946180c38",
    storageBucket: "braided-field-wgmzr.firebasestorage.app",
    messagingSenderId: "988621309224",
  };

  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (e) {
  console.warn('Firebase initialization skipped or offline:', e);
}

export { db, auth };
export default app;
