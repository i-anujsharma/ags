// ============================================================
// products.js — Product CRUD + rendering helpers
// ============================================================

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { formatPrice, addToCart, showToast } from "./utils.js";

export const CATEGORIES = [
  "All", "Grocery", "Snacks", "Beverages",
  "Personal Care", "Household Items", "Stationery"
];

// ── Fetch all products ────────────────────────────────────────
export async function fetchProducts(categoryFilter = "All", searchTerm = "") {
  const col = collection(db, "products");
  const snap = await getDocs(query(col, orderBy("createdAt", "desc")));
  let products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (categoryFilter && categoryFilter !== "All") {
    products = products.filter(p => p.category === categoryFilter);
  }
  if (searchTerm) {
    const s = searchTerm.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      (p.description || "").toLowerCase().includes(s)
    );
  }
  return products;
}

// ── Fetch featured products ──────────────────────────────────
export async function fetchFeatured() {
  const q = query(collection(db, "products"), where("featured", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Fetch single product ─────────────────────────────────────
export async function fetchProduct(id) {
  const snap = await getDoc(doc(db, "products", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Add product (admin) ──────────────────────────────────────
export async function addProduct(data) {
  return await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
}

// ── Update product (admin) ───────────────────────────────────
export async function updateProduct(id, data) {
  await updateDoc(doc(db, "products", id), { ...data, updatedAt: serverTimestamp() });
}

// ── Delete product (admin) ───────────────────────────────────
export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

// ── Render product card HTML ─────────────────────────────────
export function productCardHTML(p, showAdmin = false) {
  const stockBadge = p.stock === 0
    ? `<span class="badge badge-out">Out of Stock</span>`
    : p.stock < 10
      ? `<span class="badge badge-low">Low Stock (${p.stock})</span>`
      : `<span class="badge badge-in">In Stock</span>`;

  const img = p.imageURL
    ? `<img src="${p.imageURL}" alt="${p.name}" loading="lazy">`
    : `<div class="img-placeholder"><span>🛒</span></div>`;

  const adminBtns = showAdmin ? `
    <div class="admin-card-btns">
      <button class="btn-edit" data-id="${p.id}">✏ Edit</button>
      <button class="btn-del" data-id="${p.id}">🗑 Delete</button>
    </div>` : "";

  const addBtn = !showAdmin ? `
    <button class="btn-cart" data-id="${p.id}" ${p.stock === 0 ? "disabled" : ""}>
      ${p.stock === 0 ? "Out of Stock" : "Add to Cart"}
    </button>` : "";

  return `
    <div class="product-card" data-id="${p.id}">
      <a href="product.html?id=${p.id}" class="card-img-link">${img}</a>
      ${p.featured ? '<span class="featured-ribbon">⭐ Featured</span>' : ""}
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3 class="card-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <p class="card-desc">${(p.description || "").slice(0, 60)}${(p.description || "").length > 60 ? "…" : ""}</p>
        <div class="card-footer">
          <span class="card-price">${formatPrice(p.price)}</span>
          ${stockBadge}
        </div>
        ${addBtn}
        ${adminBtns}
      </div>
    </div>`;
}

// ── Attach add-to-cart listeners on rendered grid ────────────
export function attachCartListeners(products) {
  document.querySelectorAll(".btn-cart").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const id = btn.dataset.id;
      const p = products.find(x => x.id === id);
      if (p) addToCart(p);
    });
  });
}

// ── Seed sample products (run once from admin) ────────────────
export const SAMPLE_PRODUCTS = [
  { name:"Basmati Rice (5 kg)", category:"Grocery", price:350, stock:50, description:"Premium quality long-grain basmati rice.", featured:true, imageURL:"" },
  { name:"Tata Salt (1 kg)", category:"Grocery", price:22, stock:100, description:"Iodized table salt.", featured:false, imageURL:"" },
  { name:"Fortune Sunflower Oil (1 L)", category:"Grocery", price:140, stock:40, description:"Refined sunflower cooking oil.", featured:false, imageURL:"" },
  { name:"Parle-G Biscuits (800 g)", category:"Snacks", price:45, stock:80, description:"Classic glucose biscuits.", featured:true, imageURL:"" },
  { name:"Lay's Chips Classic (90 g)", category:"Snacks", price:30, stock:60, description:"Salted potato chips.", featured:false, imageURL:"" },
  { name:"Haldiram Bhujia (400 g)", category:"Snacks", price:110, stock:35, description:"Crispy spicy sev bhujia.", featured:false, imageURL:"" },
  { name:"Coca-Cola (2 L)", category:"Beverages", price:95, stock:45, description:"Chilled cola drink.", featured:false, imageURL:"" },
  { name:"Bisleri Water (1 L)", category:"Beverages", price:20, stock:120, description:"Purified mineral water.", featured:false, imageURL:"" },
  { name:"Frooti Mango Drink (200 ml)", category:"Beverages", price:15, stock:90, description:"Fresh mango drink.", featured:true, imageURL:"" },
  { name:"Colgate Toothpaste (200 g)", category:"Personal Care", price:89, stock:55, description:"Strong teeth formula toothpaste.", featured:false, imageURL:"" },
  { name:"Dove Soap (100 g)", category:"Personal Care", price:55, stock:70, description:"Moisturising beauty bar.", featured:false, imageURL:"" },
  { name:"Head & Shoulders Shampoo (180 ml)", category:"Personal Care", price:175, stock:30, description:"Anti-dandruff shampoo.", featured:true, imageURL:"" },
  { name:"Harpic Toilet Cleaner (500 ml)", category:"Household Items", price:115, stock:40, description:"Powerful toilet cleaning liquid.", featured:false, imageURL:"" },
  { name:"Vim Dishwash Gel (500 ml)", category:"Household Items", price:80, stock:50, description:"Lemon dishwash gel.", featured:false, imageURL:"" },
  { name:"Odomos Mosquito Repellent", category:"Household Items", price:65, stock:25, description:"Effective mosquito repellent cream.", featured:false, imageURL:"" },
  { name:"Classmate Notebook (200 pages)", category:"Stationery", price:60, stock:75, description:"Single-line ruled notebook.", featured:false, imageURL:"" },
  { name:"Reynolds Pen (Pack of 5)", category:"Stationery", price:35, stock:100, description:"Blue ballpoint pens.", featured:false, imageURL:"" },
  { name:"Fevicol (75 g)", category:"Stationery", price:30, stock:60, description:"Strong adhesive glue.", featured:false, imageURL:"" },
];
