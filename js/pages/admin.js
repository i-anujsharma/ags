import { mountLayout, esc } from "../ui/layout.js";
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
const gate = document.getElementById("gate"),
  panel = document.getElementById("panel"),
  pf = document.getElementById("pform");
const plist = document.getElementById("plist"),
  olist = document.getElementById("olist");
const STATUSES = ["placed", "confirmed", "out_for_delivery", "delivered", "cancelled"];
let products = [];

onUser(async (u) => {
  if (!u || !(await isAdmin(u.uid))) {
    gate.hidden = false;
    panel.hidden = true;
    gate.textContent = u ? "Ye account admin nahi hai." : "Pehle admin account se login karo.";
    return;
  }
  gate.hidden = true;
  panel.hidden = false;
  loadProducts();
  loadOrders();
});
async function loadProducts() {
  products = await getProducts(true);
  plist.innerHTML =
    products
      .map(
        (
          p,
        ) => `<div class="row"><span>${esc(p.name)} (${esc(p.category)})</span><span>₹${p.price} · stock ${p.stock}${p.active ? "" : " · hidden"}</span>
    <span><button class="qty" data-edit="${p.id}">Edit</button> <button class="qty" data-del="${p.id}">Delete</button></span></div>`,
      )
      .join("") || "<p>Koi product nahi.</p>";
}
async function loadOrders() {
  const os = await allOrders();
  olist.innerHTML =
    os
      .map(
        (
          o,
        ) => `<article class="card order"><p><b>${esc(o.customerName)}</b> [${esc(o.sellerName || "AGS")}] · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a> · ₹${o.totalAmount}</p>
    <p>${esc(o.address)}</p><p>${o.items.map((i) => esc(i.name) + " x" + i.qty).join(", ")}</p>
    <select data-oid="${o.id}">${STATUSES.map((s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></article>`,
      )
      .join("") || "<p>Koi order nahi.</p>";
}
pf.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(pf);
  await saveProduct(f.get("id") || null, {
    name: f.get("name").trim(),
    price: Number(f.get("price")),
    category: f.get("category").trim(),
    stock: Number(f.get("stock")),
    imageUrl: f.get("imageUrl").trim(),
    active: f.get("active") === "on",
    sellerUID: "ags",
    sellerName: "Ankit General Store",
  });
  pf.reset();
  pf.active.checked = true;
  loadProducts();
});
plist.addEventListener("click", async (e) => {
  const ed = e.target.dataset.edit,
    del = e.target.dataset.del;
  if (ed) {
    const p = products.find((x) => x.id === ed);
    for (const k of ["name", "price", "category", "stock", "imageUrl"]) pf[k].value = p[k] ?? "";
    pf.id.value = p.id;
    pf.active.checked = p.active;
    pf.scrollIntoView();
  }
  if (del && confirm("Delete karna hai?")) {
    await deleteProduct(del);
    loadProducts();
  }
});
olist.addEventListener("change", (e) => {
  if (e.target.dataset.oid) setStatus(e.target.dataset.oid, e.target.value);
});

// ---- Seller applications (approve / reject) ----
const slist = document.getElementById("slist");
async function loadSellers() {
  const ss = await listSellers();
  slist.innerHTML =
    ss
      .map(
        (s) => `<div class="row"><span>${esc(s.shopName)}</span>
      <span>${esc(s.phone)} · ${esc(s.status)}</span>
      <span><button class="qty" data-sid="${s.id}" data-st="approved">Approve</button>
      <button class="qty" data-sid="${s.id}" data-st="rejected">Reject</button></span></div>`,
      )
      .join("") || "<p>Koi seller application nahi.</p>";
}
slist.addEventListener("click", async (e) => {
  const id = e.target.dataset.sid;
  if (!id) return;
  await setSellerStatus(id, e.target.dataset.st);
  loadSellers();
});
onUser(async (u) => {
  if (u && (await isAdmin(u.uid))) loadSellers();
});