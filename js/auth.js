// ============================================================
// auth.js — All authentication functions
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { auth, db, ADMIN_EMAIL } from "./firebase.js";

// ── Register new user ────────────────────────────────────────
export async function registerUser(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Set display name
  await updateProfile(cred.user, { displayName: name });
  // Save to Firestore users collection
  await setDoc(doc(db, "users", cred.user.uid), {
    uid:       cred.user.uid,
    name:      name,
    email:     email,
    role:      "customer",
    createdAt: serverTimestamp()
  });
  return cred.user;
}

// ── Login existing user ──────────────────────────────────────
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Logout ───────────────────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
}

// ── Password reset email ─────────────────────────────────────
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// ── Get user Firestore document ──────────────────────────────
export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ── Check if user is admin ───────────────────────────────────
export function isAdmin(user) {
  return user && user.email === "anuj7harma@gmail.com";
}

// ── Watch auth state changes ─────────────────────────────────
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Require login — redirect if not logged in ────────────────
export function requireAuth(redirectTo = "login.html") {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user) {
        window.location.href = redirectTo;
      } else {
        resolve(user);
      }
    });
  });
}

// ── Require admin — redirect if not admin ────────────────────
export function requireAdmin(redirectTo = "index.html") {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user || !isAdmin(user)) {
        alert("Admin access only. Please login with admin account.");
        window.location.href = redirectTo;
      } else {
        resolve(user);
      }
    });
  });
}