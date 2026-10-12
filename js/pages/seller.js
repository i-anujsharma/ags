import { mountLayout, esc } from "../ui/layout.js";
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
const pf = $("pform");
let user = null;
let seller = null;
let products = [];

// Page ki state: login nahi / apply nahi kiya / pending / rejected / approved
async function refresh() {
  $("apply").hidden = true;
  $("panel").hidden = true;
  $("gate").innerHTML = "";
  if (!user) {
    $("gate").innerHTML =
      'Seller banne ke liye pehle <a href="login.html?next=seller.html">login karo</a>.';
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
    await applySeller(user.uid, {
      shopName: f.get("shopName").trim(),
      phone: f.get("phone").trim(),
    });
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
        (p) => `<div class="row"><span>${esc(p.name)} (${esc(p.category)})</span>
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
    sellerUID: user.uid,
    sellerName: seller.shopName,
  });
  pf.reset();
  pf.active.checked = true;
  loadProducts();
});

$("plist").addEventListener("click", async (e) => {
  const ed = e.target.dataset.edit;
  const del = e.target.dataset.del;
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

$("olist").addEventListener("change", (e) => {
  if (e.target.dataset.oid) setStatus(e.target.dataset.oid, e.target.value);
});