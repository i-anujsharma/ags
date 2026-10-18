import { mountLayout, esc, mainImage, discountPct } from "../ui/layout.js";
import { addToCart } from "../services/cart.js";
import { getProducts } from "../services/db.js";

mountLayout();

let PRODUCTS = [];
let cat = "All";
let q = "";
const chips = document.getElementById("chips");
const grid = document.getElementById("grid");
const search = document.getElementById("search");

function renderChips() {
  const cats = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
  chips.innerHTML = cats
    .map((c) => `<button class="chip" aria-pressed="${c === cat}" data-cat="${esc(c)}">${esc(c)}</button>`)
    .join("");
}

function renderGrid() {
  const list = PRODUCTS.filter(
    (p) =>
      (cat === "All" || p.category === cat) && (p.name + " " + (p.brand || "")).toLowerCase().includes(q),
  );
  grid.innerHTML = list.length
    ? list
        .map((p) => {
          const off = discountPct(p);
          const img = mainImage(p);
          return `<article class="card">
      <a class="card-link" href="product.html?id=${p.id}">
        ${img ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" />` : ""}
        ${off ? `<span class="off tag">${off}% off</span>` : ""}
        <div class="card-tag">${esc(p.category)} · ${esc(p.sellerName || "Ankit General Store")}</div>
        <h3>${esc(p.name)}</h3>
        ${p.unit ? `<div class="card-tag">${esc(p.unit)}</div>` : ""}
        <p class="price">₹${p.price}${off ? ` <s class="mrp">₹${p.mrp}</s>` : ""}</p>
      </a>
      <p class="stock ${p.stock > 0 ? "" : "out"}">${p.stock > 0 ? p.stock + " in stock" : "Out of stock"}</p>
      <button class="btn" data-id="${p.id}" ${p.stock > 0 ? "" : "disabled"}>Add to cart</button>
    </article>`;
        })
        .join("")
    : `<p class="empty">Koi product nahi mila.</p>`;
}

chips.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]");
  if (b) {
    cat = b.dataset.cat;
    renderChips();
    renderGrid();
  }
});
search.addEventListener("input", () => {
  q = search.value.trim().toLowerCase();
  renderGrid();
});
grid.addEventListener("click", (e) => {
  const b = e.target.closest("[data-id]");
  if (!b) return;
  const p = PRODUCTS.find((x) => x.id === b.dataset.id);
  addToCart(p, p.stock);
  b.classList.add("added");
  setTimeout(() => b.classList.remove("added"), 600);
});

try {
  PRODUCTS = await getProducts();
  renderChips();
  renderGrid();
} catch (e) {
  grid.innerHTML = `<p class="empty">Products load nahi hue. firebase-config.js aur Firestore rules check karo.</p>`;
  console.error(e);
}