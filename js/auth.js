// ============================================================
// auth.js — Authentication helpers (login / signup / logout)
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db, ADMIN_EMAIL } from "./firebase.js";
import { showToast } from "./utils.js";

// ── Observe auth state & call callback ─────────────────────
export function watchAuth(cb) {
  onAuthStateChanged(auth, cb);
}

// ── Sign Up ─────────────────────────────────────────────────
export async function registerUser(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    uid:       cred.user.uid,
    name,
    email,
    role:      "customer",
    createdAt: serverTimestamp()
  });
  return cred.user;
}

// ── Login ────────────────────────────────────────────────────
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Logout ───────────────────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
}

// ── Password Reset ───────────────────────────────────────────
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// ── Get user document from Firestore ────────────────────────
export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ── Is admin? ────────────────────────────────────────────────
export function isAdmin(user) {
  return user && user.email === ADMIN_EMAIL;
}

// ── Guard: redirect if not logged in ────────────────────────
export function requireAuth(redirectTo = "login.html") {
  return new Promise(resolve => {
    const unsub = onAuthStateChanged(auth, user => {
      unsub();
      if (!user) {
        window.location.href = redirectTo;
      } else {
        resolve(user);
      }
    });
  });
}

// ── Guard: redirect if not admin ─────────────────────────────
export function requireAdmin(redirectTo = "index.html") {
  return new Promise(resolve => {
    const unsub = onAuthStateChanged(auth, user => {
      unsub();
      if (!user || !isAdmin(user)) {
        showToast("Admin access only.", "error");
        setTimeout(() => window.location.href = redirectTo, 1500);
      } else {
        resolve(user);
      }
    });
  });
}
