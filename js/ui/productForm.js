// Shared product form: admin aur seller dono isi ko use karte hain.
// Flipkart/Amazon jaisi detail: brand, MRP, unit, description, highlights, specs, multiple photos.

const TEMPLATE = `
<form class="box pform" novalidate>
  <input type="hidden" name="pid" />
  <h3>Basic details</h3>
  <div class="fgrid">
    <label>Product name *<input name="name" placeholder="Jaise: Glow Face Cream" /></label>
    <label>Brand<input name="brand" placeholder="Jaise: Glow" /></label>
    <label>Category *<input name="category" placeholder="Jaise: Personal Care" /></label>
    <label>Unit / size<input name="unit" placeholder="Jaise: 50 g, 1 L, 1 pc" /></label>
  </div>

  <h3>Price and stock</h3>
  <div class="fgrid">
    <label>Selling price (₹) *<input name="price" type="number" min="0" step="1" /></label>
    <label>MRP (₹)<input name="mrp" type="number" min="0" step="1" placeholder="Original price (discount dikhane ke liye)" /></label>
    <label>Stock *<input name="stock" type="number" min="0" step="1" /></label>
  </div>

  <h3>Photos</h3>
  <p class="hint">Pehli photo main image hogi. Har photo ka seedha link (https://...) paste karo.</p>
  <div class="img-list"></div>
  <button type="button" class="qty add-img">+ Add photo</button>

  <h3>Description</h3>
  <label>Short description<input name="shortDesc" maxlength="140" placeholder="Ek line mein product ke baare mein" /></label>
  <label>Full description<textarea name="description" rows="4"></textarea></label>
  <label>Highlights (har line mein ek point)<textarea name="highlights" rows="4" placeholder="Skin ko moisturise karta hai\nDermatologically tested"></textarea></label>
  <label>Specifications (har line: Naam: Value)<textarea name="specs" rows="4" placeholder="Brand: Glow\nWeight: 50 g\nShelf life: 24 months"></textarea></label>

  <label class="check"><input type="checkbox" name="active" checked /> Dikhao (active)</label>
  <p class="form-msg" role="status"></p>
  <div class="form-actions">
    <button class="btn" type="submit">Save product</button>
    <button class="qty" type="reset">Clear / new product</button>
  </div>
</form>`;

const lines = (s) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

// root: jis div mein form dikhana hai. onSubmit(data, id): data save karne ka kaam caller karega.
export function mountProductForm(root, onSubmit) {
  root.innerHTML = TEMPLATE;
  const form = root.querySelector("form");
  const list = root.querySelector(".img-list");
  const msg = root.querySelector(".form-msg");
  const field = (n) => form.elements.namedItem(n);

  const say = (text, ok = false) => {
    msg.textContent = text;
    msg.className = "form-msg " + (ok ? "ok" : "err");
  };

  function addRow(url = "") {
    const row = document.createElement("div");
    row.className = "img-row";
    row.innerHTML =
      '<img class="thumb" alt="" hidden /><input type="url" placeholder="https://..." />' +
      '<button type="button" class="qty rm" aria-label="Photo hatao">✕</button>';
    const input = row.querySelector("input");
    const img = row.querySelector("img");
    input.value = url;
    const preview = () => {
      const v = input.value.trim();
      img.hidden = !v;
      if (v) img.src = v;
    };
    img.onerror = () => (img.hidden = true);
    input.addEventListener("input", preview);
    row.querySelector(".rm").onclick = () => {
      row.remove();
      if (!list.children.length) addRow();
    };
    list.append(row);
    preview();
  }

  function clearAll() {
    list.innerHTML = "";
    addRow();
    field("pid").value = "";
    say("");
  }
  clearAll();

  root.querySelector(".add-img").addEventListener("click", () => addRow());
  form.addEventListener("reset", () => setTimeout(clearAll));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const name = f.get("name").trim();
    const category = f.get("category").trim();
    const price = Number(f.get("price"));
    const mrp = Number(f.get("mrp")) || 0;
    const stock = Number(f.get("stock"));
    const images = [...list.querySelectorAll("input")].map((i) => i.value.trim()).filter(Boolean);

    if (!name || !category) return say("Product naam aur category zaroori hain.");
    if (!(price > 0)) return say("Selling price 0 se bada hona chahiye.");
    if (mrp && mrp < price) return say("MRP selling price se kam nahi ho sakta.");
    if (!(stock >= 0) || f.get("stock") === "") return say("Stock daalo (0 ya usse zyada).");
    if (images.some((u) => !/^https?:\/\//i.test(u)))
      return say("Photo ka link https:// se shuru hona chahiye.");

    const data = {
      name,
      brand: f.get("brand").trim(),
      category,
      unit: f.get("unit").trim(),
      price,
      mrp,
      stock,
      shortDesc: f.get("shortDesc").trim(),
      description: f.get("description").trim(),
      highlights: lines(f.get("highlights")),
      specs: lines(f.get("specs")),
      images,
      imageUrl: images[0] || "",
      active: f.get("active") === "on",
    };

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      await onSubmit(data, f.get("pid") || null);
      form.reset();
      say("Product save ho gaya ✓", true);
    } catch (err) {
      console.error(err);
      say("Save nahi hua: " + (err.code || err.message));
    }
    btn.disabled = false;
  });

  return {
    // Edit ke liye form mein product bharo
    fill(p) {
      for (const k of [
        "name",
        "brand",
        "category",
        "unit",
        "price",
        "mrp",
        "stock",
        "shortDesc",
        "description",
      ]) {
        field(k).value = p[k] ?? "";
      }
      field("highlights").value = (p.highlights || []).join("\n");
      field("specs").value = (p.specs || []).join("\n");
      field("active").checked = p.active !== false;
      field("pid").value = p.id;
      list.innerHTML = "";
      const imgs = p.images && p.images.length ? p.images : p.imageUrl ? [p.imageUrl] : [];
      (imgs.length ? imgs : [""]).forEach(addRow);
      say("Edit mode: badlav karke Save dabao.", true);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  };
}