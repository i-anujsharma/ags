// Saare Firebase calls sirf yahin. Field names schema.md ke hisaab se.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  sendPasswordResetEmail,
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);
const rows = (s) => s.docs.map((d) => ({ id: d.id, ...d.data() }));
const byNew = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);

export const onUser = (cb) => onAuthStateChanged(auth, cb);
export const login = (e, p) => signInWithEmailAndPassword(auth, e, p);
export const logout = () => signOut(auth);
export async function signup(name, phone, email, pw) {
  const c = await createUserWithEmailAndPassword(auth, email, pw);
  await setDoc(doc(db, "users", c.user.uid), {
    name,
    phone,
    createdAt: serverTimestamp(),
  });
  return c.user;
}
export async function isAdmin(uid) {
  try {
    return (await getDoc(doc(db, "admins", uid))).exists();
  } catch {
    return false;
  }
}
// Customer sirf active products padh sakta hai (rules), isliye where lagana zaroori.
export async function getProducts(all = false) {
  const ref = collection(db, "products");
  return rows(await getDocs(all ? ref : query(ref, where("active", "==", true))));
}
export async function saveProduct(id, d) {
  if (id) return setDoc(doc(db, "products", id), d, { merge: true });
  return addDoc(collection(db, "products"), { ...d, createdAt: serverTimestamp() });
}
export const deleteProduct = (id) => deleteDoc(doc(db, "products", id));
export const placeOrder = (o) =>
  addDoc(collection(db, "orders"), {
    ...o,
    status: "placed",
    createdAt: serverTimestamp(),
  });
export async function myOrders(uid) {
  return rows(await getDocs(query(collection(db, "orders"), where("customerUID", "==", uid)))).sort(
    byNew,
  );
}
export async function allOrders() {
  return rows(await getDocs(collection(db, "orders"))).sort(byNew);
}
export const setStatus = (id, status) => updateDoc(doc(db, "orders", id), { status });

// ---- Sellers (marketplace) ----
export async function getSeller(uid) {
  const s = await getDoc(doc(db, "sellers", uid));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}
export const applySeller = (uid, d) =>
  setDoc(doc(db, "sellers", uid), {
    ...d,
    status: "pending",
    createdAt: serverTimestamp(),
  });
export async function listSellers() {
  return rows(await getDocs(collection(db, "sellers")));
}
export const setSellerStatus = (uid, status) => updateDoc(doc(db, "sellers", uid), { status });
export async function sellerProducts(uid) {
  return rows(await getDocs(query(collection(db, "products"), where("sellerUID", "==", uid))));
}
export async function sellerOrders(uid) {
  return rows(await getDocs(query(collection(db, "orders"), where("sellerUID", "==", uid)))).sort(
    byNew,
  );
}

// Forgot password: Firebase email par reset link bhejta hai
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);