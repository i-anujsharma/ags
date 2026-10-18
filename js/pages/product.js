import { mountLayout, esc, productImages, discountPct } from "../ui/layout.js";
import { addToCart } from "../services/cart.js";
import { getProduct } from "../services/db.js";

mountLayout();

const root = document.getElementById("product");
const id = new URLSearchParams(location.search).get("id");

function render(p) {
  document.title = p.name + " · AGS";
  const imgs = productImages(p);
  const off = discountPct(p);
  const inStock = p.stock > 0;
  const specs = (p.specs || []).map((s) => {
    const i = s.indexOf(":");
    return i > 0 ? [s.slice(0, i).trim(), s.slice(i + 1).trim()] : ["", s];
  });

  root.innerHTML = `
  <div class="pd">
    <div class="gallery">
      <div class="main-img">
        ${imgs[0] ? `<img id="main-img" src="${esc(imgs[0])}" alt="${esc(p.name)}" />` : `<div class="no-img">${esc(p.name[0] || "?")}</div>`}
      </div>
      ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((u, i) => `<button class="thumb-btn" data-i="${i}" aria-pressed="${i === 0}" aria-label="Photo ${i + 1}"><img src="${esc(u)}" alt="" /></button>`).join("")}</div>` : ""}
    </div>
    <div class="info">
      <p class="card-tag">${esc(p.category)}${p.brand ? " · " + esc(p.brand) : ""}</p>
      <h1>${esc(p.name)}</h1>
      <p class="card-tag">Seller: ${esc(p.sellerName || "Ankit General Store")}</p>
      <p class="pricebox"><span class="price big">₹${p.price}</span>
        ${off ? `<s class="mrp">₹${p.mrp}</s> <span class="off">${off}% off</span>` : ""}</p>
      ${p.unit ? `<p class="card-tag">${esc(p.unit)}</p>` : ""}
      <p class="stock ${inStock ? "" : "out"}">${inStock ? p.stock + " in stock" : "Out of stock"}</p>
      ${p.shortDesc ? `<p>${esc(p.shortDesc)}</p>` : ""}
      ${
        inStock
          ? `<div class="buy">
              <div class="stepper"><button class="qty" id="minus" aria-label="Kam karo">−</button>
              <span id="q">1</span><button class="qty" id="plus" aria-label="Zyada karo">+</button></div>
              <button class="btn" id="add">Add to cart</button>
            </div>`
          : ""
      }
      <p id="added" class="ok" role="status"></p>
      ${p.highlights && p.highlights.length ? `<h3>Highlights</h3><ul class="points">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      ${p.description ? `<h3>Description</h3><p class="desc">${esc(p.description)}</p>` : ""}
      ${specs.length ? `<h3>Specifications</h3><table class="specs">${specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>` : ""}
    </div>
  </div>`;

  // Thumbnail par click: badi photo badlo
  root.querySelector(".thumbs")?.addEventListener("click", (e) => {
    const b = e.target.closest(".thumb-btn");
    if (!b) return;
    document.getElementById("main-img").src = imgs[b.dataset.i];
    root.querySelectorAll(".thumb-btn").forEach((x) => x.setAttribute("aria-pressed", x === b));
  });

  if (inStock) {
    let qty = 1;
    const qEl = document.getElementById("q");
    document.getElementById("minus").onclick = () => (qEl.textContent = qty = Math.max(1, qty - 1));
    document.getElementById("plus").onclick = () => (qEl.textContent = qty = Math.min(p.stock, qty + 1));
    document.getElementById("add").onclick = () => {
      for (let i = 0; i < qty; i++) addToCart(p, p.stock);
      document.getElementById("added").innerHTML =
        `${qty} item cart mein add ho gaya ✓ <a href="cart.html">Cart dekho</a>`;
    };
  }
}

try {
  const p = id ? await getProduct(id) : null;
  if (p) render(p);
  else root.innerHTML = `<p class="empty">Product nahi mila. <a href="index.html">Home par jao</a></p>`;
} catch (e) {
  console.error(e);
  root.innerHTML = `<p class="empty">Product load nahi hua. <a href="index.html">Home par jao</a></p>`;
}