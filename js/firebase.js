// ============================================================
// firebase.js — Firebase App Initialization & Config
// ============================================================

import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence }
                           from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─────────────────────────────────────────────────────────────
//  STEP 1: Paste your Firebase config values below
//  Get them from: Firebase Console → Project Settings → Your apps → Web app
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB9Z7K293ydkuy2jZHpqzawDBI-FtZVB6o",
  authDomain: "ankit-general-store-33443.firebaseapp.com",
  projectId: "ankit-general-store-33443",
  storageBucket: "ankit-general-store-33443.firebasestorage.app",
  messagingSenderId: "46126405791",
  appId: "1:46126405791:web:e2dca04c30a1ec303caaaa",
  measurementId: "G-TD2KF7CHP1"
};
// ─────────────────────────────────────────────────────────────
//  STEP 2: Set your admin email (must match Firebase Auth user)
// ─────────────────────────────────────────────────────────────
export const ADMIN_EMAIL     = "anuj7harma@gmail.com";
export const WHATSAPP_NUMBER = "917617263817";
// ─────────────────────────────────────────────────────────────

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Keep user logged in even after browser/tab close
setPersistence(auth, browserLocalPersistence).catch(console.error);

export { auth, db };
