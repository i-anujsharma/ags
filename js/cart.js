// ============================================================
// cart.js — Cart page logic
// ============================================================

import { getCart, saveCart, formatPrice, showToast, showLoader, hideLoader } from "./utils.js";
import { WHATSAPP_NUMBER } from "./firebase.js";
import { watchAuth } from "./auth.js";
import { fetchProduct } from "./products.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase.js";

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  watchAuth(user => { currentUser = user; });
  renderCart();
  document.getElementById("checkout-btn")?.addEventListener("click", placeWhatsAppOrder);
});

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const summary   = document.getElementById("cart-summary");
  const empty     = document.getElementById("cart-empty");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "";
    if (summary) summary.style.display = "none";
    if (empty)   empty.style.display = "block";
    return;
  }

  if (empty)   empty.style.display = "none";
  if (summary) summary.style.display = "block";

  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-row" data-idx="${idx}">
      <div class="cart-img">
        ${item.imageURL
          ? `<img src="${item.imageURL}" alt="${item.name}">`
          : `<div class="img-placeholder small">🛒</div>`}
      </div>
      <div class="cart-info">
        <h4>${item.name}</h4>
        <span class="cart-cat">${item.category}</span>
        <span class="cart-unit-price">${formatPrice(item.price)} / unit</span>
      </div>
      <div class="cart-qty-ctrl">
        <button class="qty-btn minus" data-idx="${idx}">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn plus" data-idx="${idx}" ${item.qty >= item.stock ? "disabled" : ""}>+</button>
      </div>
      <div class="cart-item-total">${formatPrice(item.price * item.qty)}</div>
      <button class="cart-remove" data-idx="${idx}" title="Remove">✕</button>
    </div>
  `).join("");

  updateSummary();
  attachCartEvents();
}

function updateSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const el = document.getElementById("cart-total-amt");
  if (el) el.textContent = formatPrice(subtotal);
  const items = document.getElementById("cart-item-count");
  if (items) items.textContent = `${cart.reduce((s,i)=>s+i.qty,0)} item(s)`;
}

function attachCartEvents() {
  document.querySelectorAll(".qty-btn.plus").forEach(btn => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const idx = +btn.dataset.idx;
      if (cart[idx].qty < cart[idx].stock) {
        cart[idx].qty++;
        saveCart(cart);
        renderCart();
      }
    });
  });
  document.querySelectorAll(".qty-btn.minus").forEach(btn => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const idx = +btn.dataset.idx;
      if (cart[idx].qty > 1) {
        cart[idx].qty--;
      } else {
        cart.splice(idx, 1);
      }
      saveCart(cart);
      renderCart();
    });
  });
  document.querySelectorAll(".cart-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      cart.splice(+btn.dataset.idx, 1);
      saveCart(cart);
      renderCart();
      showToast("Item removed", "info");
    });
  });
}

async function placeWhatsAppOrder() {
  const cart = getCart();
  if (cart.length === 0) { showToast("Cart is empty!", "warning"); return; }

  const name = currentUser?.displayName || "Customer";

  const lines = cart.map(i =>
    `• ${i.name} × ${i.qty} = ${formatPrice(i.price * i.qty)}`
  ).join("%0A");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const msg = encodeURIComponent(
    `Hello AGS! 🛒\n\nI would like to place an order:\n\n` +
    cart.map(i => `• ${i.name} × ${i.qty} = ₹${i.price * i.qty}`).join("\n") +
    `\n\n*Total: ₹${total}*\nCustomer: ${name}\n\nThank You! 🙏`
  );

  // Save order to Firestore if logged in
  if (currentUser) {
    try {
      await addDoc(collection(db, "orders"), {
        orderId:      `AGS-${Date.now()}`,
        customerName: name,
        customerUID:  currentUser.uid,
        customerEmail:currentUser.email,
        products:     cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        totalAmount:  total,
        status:       "pending",
        date:         serverTimestamp()
      });
    } catch(e) { console.error("Order save failed:", e); }
  }

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}