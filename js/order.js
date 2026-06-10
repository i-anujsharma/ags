// ============================================================
//  AGS ORDER SYSTEM  —  order.js
//  Drop this file in your project root.
//  It handles: Buy Now, Checkout, Order Placement in Firebase
// ============================================================

import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ─── BUY NOW ──────────────────────────────────────────────
// Call this when "Buy Now" button is clicked on a product card.
// It skips the cart and goes straight to checkout.
export function buyNow(product) {
  // Store only this one product as "buy-now session"
  sessionStorage.setItem("buyNowItem", JSON.stringify(product));
  window.location.href = "checkout.html?mode=buynow";
}

// ─── PLACE ORDER ──────────────────────────────────────────
// Called from checkout page on "Confirm Order".
// items  = array of { id, name, price, qty, image }
// address = { name, phone, address, city, pincode }
export async function placeOrder(items, address) {
  const user = auth.currentUser;

  const orderData = {
    userId: user ? user.uid : "guest",
    userEmail: user ? user.email : address.phone,
    userName: address.name,
    phone: address.phone,
    address: address,
    items: items,
    totalAmount: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    status: "Pending",           // Pending → Confirmed → Shipped → Delivered
    paymentMethod: "COD",        // Cash on Delivery
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "orders"), orderData);
  return docRef.id;  // return the order ID
}

// ─── GET ORDERS FOR CURRENT USER ──────────────────────────
export async function getMyOrders() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "orders"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── GET SINGLE ORDER ─────────────────────────────────────
export async function getOrder(orderId) {
  const snap = await getDoc(doc(db, "orders", orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ─── ADMIN: GET ALL ORDERS ────────────────────────────────
export async function getAllOrders() {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── ADMIN: UPDATE ORDER STATUS ───────────────────────────
export async function updateOrderStatus(orderId, newStatus) {
  await updateDoc(doc(db, "orders", orderId), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
}