import { mountLayout, esc, mainImage } from "../ui/layout.js";
import { mountProductForm } from "../ui/productForm.js";
import {
  onUser,
  isAdmin,
  getProducts,
  saveProduct,
  deleteProduct,
  allOrders,
  setStatus,
  listSellers,
  setSellerStatus,
} from "../services/db.js";

mountLayout();

const $ = (id) => document.getElementById(id);
const STATUSES = ["placed", "confirmed", "out_for_delivery", "delivered", "cancelled"];
let products = [];

// AGS ke apne products: sellerUID = "ags"
const form = mountProductForm($("product-form-root"), async (data, id) => {
  await saveProduct(id, { ...data, sellerUID: "ags", sellerName: "Ankit General Store" });
  loadProducts();
});

onUser(async (u) => {
  if (!u || !(await isAdmin(u.uid))) {
    $("gate").hidden = false;
    $("panel").hidden = true;
    $("gate").textContent = u ? "Ye account admin nahi hai." : "Pehle admin account se login karo.";
    return;
  }
  $("gate").hidden = true;
  $("panel").hidden = false;
  loadProducts();
  loadOrders();
  loadSellers();
});

async function loadProducts() {
  products = await getProducts(true);
  $("plist").innerHTML =
    products
      .map(
        (p) => `<div class="row">
      <span class="pname">${mainImage(p) ? `<img class="thumb" src="${esc(mainImage(p))}" alt="" />` : ""}${esc(p.name)} (${esc(p.category)})</span>
      <span>₹${p.price} · stock ${p.stock}${p.active ? "" : " · hidden"}</span>
      <span><button class="qty" data-edit="${p.id}">Edit</button>
      <button class="qty" data-del="${p.id}">Delete</button></span></div>`,
      )
      .join("") || "<p>Koi product nahi.</p>";
}

async function loadOrders() {
  const os = await allOrders();
  $("olist").innerHTML =
    os
      .map(
        (o) => `<article class="card order">
      <p><b>${esc(o.customerName)}</b> [${esc(o.sellerName || "AGS")}] · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a> · ₹${o.totalAmount}</p>
      <p>${esc(o.address)}</p>
      <p>${o.items.map((i) => esc(i.name) + " x" + i.qty).join(", ")}</p>
      <select data-oid="${o.id}">${STATUSES.map(
        (s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`,
      ).join("")}</select></article>`,
      )
      .join("") || "<p>Koi order nahi.</p>";
}

async function loadSellers() {
  const ss = await listSellers();
  $("slist").innerHTML =
    ss
      .map(
        (s) => `<div class="row"><span>${esc(s.shopName)}</span>
      <span>${esc(s.phone)} · ${esc(s.status)}</span>
      <span><button class="qty" data-sid="${s.id}" data-st="approved">Approve</button>
      <button class="qty" data-sid="${s.id}" data-st="rejected">Reject</button></span></div>`,
      )
      .join("") || "<p>Koi seller application nahi.</p>";
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
$("slist").addEventListener("click", async (e) => {
  const id = e.target.dataset.sid;
  if (!id) return;
  await setSellerStatus(id, e.target.dataset.st);
  loadSellers();
});