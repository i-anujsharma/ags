// ============================================================
// admin.js — Admin Dashboard logic
// ============================================================

import { requireAdmin } from "./auth.js";
import {
  fetchProducts, addProduct, updateProduct, deleteProduct,
  CATEGORIES, SAMPLE_PRODUCTS, productCardHTML
} from "./products.js";
import {
  collection, getDocs, orderBy, query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { showToast, showLoader, hideLoader, formatPrice, formatDate } from "./utils.js";

let allProducts = [];
let editingId   = null;

document.addEventListener("DOMContentLoaded", async () => {
  await requireAdmin();
  showLoader("Loading admin panel…");
  await loadDashboard();
  hideLoader();
  bindEvents();
});

// ── Load dashboard data ───────────────────────────────────────
async function loadDashboard() {
  allProducts = await fetchProducts();
  renderStats();
  renderProductTable();
  await renderOrders();
}

// ── Stats cards ───────────────────────────────────────────────
function renderStats() {
  const total   = allProducts.length;
  const inStock = allProducts.filter(p => p.stock > 0).length;
  const low     = allProducts.filter(p => p.stock > 0 && p.stock < 10).length;
  const out     = allProducts.filter(p => p.stock === 0).length;
  set("stat-total",   total);
  set("stat-instock", inStock);
  set("stat-low",     low);
  set("stat-out",     out);
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Product table ─────────────────────────────────────────────
function renderProductTable(products = allProducts) {
  const tbody = document.getElementById("prod-tbody");
  if (!tbody) return;
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.imageURL || ''}" onerror="this.style.display='none'" class="tbl-img"> ${p.name}</td>
      <td>${p.category}</td>
      <td>${formatPrice(p.price)}</td>
      <td>
        <span class="${p.stock===0?'badge-out':p.stock<10?'badge-low':'badge-in'} tbl-badge">
          ${p.stock===0?"Out":p.stock<10?`Low (${p.stock})`:p.stock}
        </span>
      </td>
      <td>${p.featured ? "⭐" : "—"}</td>
      <td class="tbl-actions">
        <button class="btn-sm btn-edit" data-id="${p.id}">Edit</button>
        <button class="btn-sm btn-del" data-id="${p.id}">Delete</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".btn-edit").forEach(b =>
    b.addEventListener("click", () => openEditModal(b.dataset.id)));
  tbody.querySelectorAll(".btn-del").forEach(b =>
    b.addEventListener("click", () => confirmDelete(b.dataset.id)));
}

// ── Orders table ──────────────────────────────────────────────
async function renderOrders() {
  const tbody = document.getElementById("orders-tbody");
  if (!tbody) return;
  const snap = await getDocs(query(collection(db, "orders"), orderBy("date", "desc")));
  if (snap.empty) { tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No orders yet.</td></tr>`; return; }
  tbody.innerHTML = snap.docs.map(d => {
    const o = d.data();
    return `
      <tr>
        <td>${o.orderId || d.id.slice(0,8)}</td>
        <td>${o.customerName}</td>
        <td>${(o.products||[]).map(p=>`${p.name}×${p.qty}`).join(", ")}</td>
        <td>${formatPrice(o.totalAmount)}</td>
        <td><span class="badge-in tbl-badge">${o.status||"pending"}</span></td>
        <td>${formatDate(o.date)}</td>
      </tr>`;
  }).join("");
}

// ── Modal helpers ─────────────────────────────────────────────
function openAddModal() {
  editingId = null;
  document.getElementById("modal-title").textContent = "Add New Product";
  document.getElementById("prod-form").reset();
  document.getElementById("prod-modal").style.display = "flex";
}

function openEditModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  document.getElementById("modal-title").textContent = "Edit Product";
  const f = document.getElementById("prod-form");
  f["prod-name"].value     = p.name;
  f["prod-desc"].value     = p.description || "";
  f["prod-price"].value    = p.price;
  f["prod-stock"].value    = p.stock;
  f["prod-category"].value = p.category;
  f["prod-image"].value    = p.imageURL || "";
  f["prod-featured"].checked = p.featured || false;
  document.getElementById("prod-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("prod-modal").style.display = "none";
}

async function confirmDelete(id) {
  if (!confirm("Delete this product? This cannot be undone.")) return;
  showLoader("Deleting…");
  try {
    await deleteProduct(id);
    showToast("Product deleted.", "success");
    await loadDashboard();
  } catch(e) {
    showToast("Delete failed: " + e.message, "error");
  }
  hideLoader();
}

// ── Form submit ───────────────────────────────────────────────
async function handleProductForm(e) {
  e.preventDefault();
  const f = e.target;
  const data = {
    name:       f["prod-name"].value.trim(),
    description:f["prod-desc"].value.trim(),
    price:      Number(f["prod-price"].value),
    stock:      Number(f["prod-stock"].value),
    category:   f["prod-category"].value,
    imageURL:   f["prod-image"].value.trim(),
    featured:   f["prod-featured"].checked
  };
  if (!data.name || !data.price) { showToast("Name and price required.", "warning"); return; }
  showLoader(editingId ? "Updating…" : "Adding…");
  try {
    if (editingId) {
      await updateProduct(editingId, data);
      showToast("Product updated!", "success");
    } else {
      await addProduct(data);
      showToast("Product added!", "success");
    }
    closeModal();
    await loadDashboard();
  } catch(e) {
    showToast("Error: " + e.message, "error");
  }
  hideLoader();
}

// ── Seed sample data ──────────────────────────────────────────
async function seedData() {
  if (!confirm("This will add 18 sample products. Continue?")) return;
  showLoader("Seeding products…");
  try {
    for (const p of SAMPLE_PRODUCTS) await addProduct(p);
    showToast("Sample products added!", "success");
    await loadDashboard();
  } catch(e) {
    showToast("Seed failed: " + e.message, "error");
  }
  hideLoader();
}

// ── Search ────────────────────────────────────────────────────
function handleAdminSearch(e) {
  const s = e.target.value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
  renderProductTable(filtered);
}

// ── Nav tabs ──────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.panel)?.classList.add("active");
    });
  });
}

// ── Populate category select ──────────────────────────────────
function populateCategorySelect() {
  const sel = document.getElementById("prod-category");
  if (!sel) return;
  CATEGORIES.filter(c => c !== "All").forEach(c => {
    const o = document.createElement("option");
    o.value = o.textContent = c;
    sel.appendChild(o);
  });
}

// ── Bind all events ───────────────────────────────────────────
function bindEvents() {
  initTabs();
  populateCategorySelect();
  document.getElementById("add-prod-btn")?.addEventListener("click", openAddModal);
  document.getElementById("modal-close")?.addEventListener("click", closeModal);
  document.getElementById("prod-modal")?.addEventListener("click", e => { if(e.target===e.currentTarget) closeModal(); });
  document.getElementById("prod-form")?.addEventListener("submit", handleProductForm);
  document.getElementById("admin-search")?.addEventListener("input", handleAdminSearch);
  document.getElementById("seed-btn")?.addEventListener("click", seedData);
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    const { logoutUser } = await import("./auth.js");
    await logoutUser();
    window.location.href = "login.html";
  });
}
