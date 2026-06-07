// ============================================================
// firebase.js — Firebase App Initialization & Config
// Replace the placeholders below with your actual Firebase
// project credentials from Firebase Console.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ─── YOUR FIREBASE CONFIG ─────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB9Z7K293ydkuy2jZHpqzawDBI-FtZVB6o",
  authDomain: "ankit-general-store-33443.firebaseapp.com",
  projectId: "ankit-general-store-33443",
  storageBucket: "ankit-general-store-33443.firebasestorage.app",
  messagingSenderId: "46126405791",
  appId: "1:46126405791:web:e2dca04c30a1ec303caaaa",
  measurementId: "G-TD2KF7CHP1"
};

// ──────────────────────────────────────────────────────────

const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

// Admin email — change this to your admin email
export const ADMIN_EMAIL = "anuj7harma@gmail.com";

// WhatsApp number (with country code, no + or spaces)
export const WHATSAPP_NUMBER = "917617263817";

export { auth, db, storage };
