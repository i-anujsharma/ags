// ============================================================
// utils.js — Shared utility functions
// ============================================================

// ── Toast notifications ──────────────────────────────────────
export function showToast(message, type = "info", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icons = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ── Loading overlay ──────────────────────────────────────────
export function showLoader(text = "Loading...") {
  let el = document.getElementById("global-loader");
  if (!el) {
    el = document.createElement("div");
    el.id = "global-loader";
    el.innerHTML = `<div class="loader-box"><div class="spinner"></div><p>${text}</p></div>`;
    document.body.appendChild(el);
  } else {
    el.querySelector("p").textContent = text;
  }
  el.style.display = "flex";
}

export function hideLoader() {
  const el = document.getElementById("global-loader");
  if (el) el.style.display = "none";
}

// ── Format currency ──────────────────────────────────────────
export function formatPrice(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

// ── Format date ──────────────────────────────────────────────
export function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Debounce ─────────────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ── Cart helpers (localStorage) ─────────────────────────────
export function getCart() {
  return JSON.parse(localStorage.getItem("ags_cart") || "[]");
}

export function saveCart(cart) {
  localStorage.setItem("ags_cart", JSON.stringify(cart));
  updateCartBadge();
}

export function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty = Math.min(cart[idx].qty + qty, product.stock);
  } else {
    cart.push({ ...product, qty: Math.min(qty, product.stock) });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart!`, "success");
}

export function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-badge").forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? "flex" : "none";
  });
}

// ── Dark mode ────────────────────────────────────────────────
export function initDarkMode() {
  const saved = localStorage.getItem("ags_dark");
  if (saved === "1") document.body.classList.add("dark");
  document.querySelectorAll(".dark-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("ags_dark", document.body.classList.contains("dark") ? "1" : "0");
      btn.textContent = document.body.classList.contains("dark") ? "☀" : "🌙";
    });
    btn.textContent = document.body.classList.contains("dark") ? "☀" : "🌙";
  });
}