import { mountLayout, esc, mainImage } from "../ui/layout.js";
import { mountProductForm } from "../ui/productForm.js";
import {
  onUser,
  getSeller,
  applySeller,
  sellerProducts,
  saveProduct,
  deleteProduct,
  sellerOrders,
  setStatus,
} from "../services/db.js";

mountLayout();

const $ = (id) => document.getElementById(id);
const STATUSES = ["placed", "confirmed", "out_for_delivery", "delivered", "cancelled"];
let user = null;
let seller = null;
let products = [];

const form = mountProductForm($("product-form-root"), async (data, id) => {
  await saveProduct(id, { ...data, sellerUID: user.uid, sellerName: seller.shopName });
  loadProducts();
});

// Page ki state: login nahi / apply nahi kiya / pending / rejected / approved
async function refresh() {
  $("apply").hidden = true;
  $("panel").hidden = true;
  $("gate").innerHTML = "";
  if (!user) {
    $("gate").innerHTML = 'Seller banne ke liye pehle <a href="login.html?next=seller.html">login karo</a>.';
    return;
  }
  seller = await getSeller(user.uid);
  if (!seller) {
    $("apply").hidden = false;
  } else if (seller.status === "pending") {
    $("gate").textContent = "Aapki application admin ke approval ka wait kar rahi hai.";
  } else if (seller.status === "rejected") {
    $("gate").textContent = "Aapki application approve nahi hui. Store se sampark karo.";
  } else {
    $("panel").hidden = false;
    $("shop-title").textContent = seller.shopName;
    loadProducts();
    loadOrders();
  }
}

onUser((u) => {
  user = u;
  refresh();
});

$("apply").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    await applySeller(user.uid, { shopName: f.get("shopName").trim(), phone: f.get("phone").trim() });
    refresh();
  } catch (err) {
    $("gate").textContent = "Apply nahi hua: " + err.message;
  }
});

async function loadProducts() {
  products = await sellerProducts(user.uid);
  $("plist").innerHTML =
    products
      .map(
        (p) => `<div class="row">
      <span class="pname">${mainImage(p) ? `<img class="thumb" src="${esc(mainImage(p))}" alt="" />` : ""}${esc(p.name)} (${esc(p.category)})</span>
      <span>₹${p.price} · stock ${p.stock}${p.active ? "" : " · hidden"}</span>
      <span><button class="qty" data-edit="${p.id}">Edit</button>
      <button class="qty" data-del="${p.id}">Delete</button></span></div>`,
      )
      .join("") || "<p>Abhi koi product nahi.</p>";
}

async function loadOrders() {
  const os = await sellerOrders(user.uid);
  $("olist").innerHTML =
    os
      .map(
        (o) => `<article class="card order">
      <p><b>${esc(o.customerName)}</b> · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a> · ₹${o.totalAmount}</p>
      <p>${esc(o.address)}</p>
      <p>${o.items.map((i) => esc(i.name) + " x" + i.qty).join(", ")}</p>
      <select data-oid="${o.id}">${STATUSES.map(
        (s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`,
      ).join("")}</select></article>`,
      )
      .join("") || "<p>Abhi koi order nahi.</p>";
}

$("plist").addEventListener("click", async (e) => {
  const ed = e.target.dataset.edit;
  const del = e.target.dataset.del;
  if (ed) form.fill(products.find((x) => x.id === ed));
  if (del && confirm("Delete karna hai?")) {
    await deleteProduct(del);
    loadProducts();
  }
});
$("olist").addEventListener("change", (e) => {
  if (e.target.dataset.oid) setStatus(e.target.dataset.oid, e.target.value);
});