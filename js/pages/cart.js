import { mountLayout, esc } from "../ui/layout.js";
import { getCart, setQty, cartTotal, clearCart } from "../services/cart.js";
import { onUser, placeOrder } from "../services/db.js";
mountLayout();
let user = null;
const list = document.getElementById("list"),
  total = document.getElementById("total"),
  form = document.getElementById("order-form"),
  note = document.getElementById("note"),
  btn = document.getElementById("place");
onUser((u) => {
  user = u;
  note.textContent = u ? "" : "Order karne ke liye pehle login karo.";
});

function render() {
  const items = getCart();
  list.innerHTML = items.length
    ? items
        .map(
          (i) => `
    <div class="row"><span>${esc(i.name)}</span><span>₹${i.price}</span>
    <span><button class="qty" data-id="${i.productId}" data-d="-1">−</button> ${i.qty} <button class="qty" data-id="${i.productId}" data-d="1">+</button></span>
    <b>₹${i.price * i.qty}</b></div>`,
        )
        .join("")
    : `<p class="empty">Cart khaali hai. <a href="index.html">Products dekho</a></p>`;
  total.textContent = "₹" + cartTotal();
  form.hidden = !items.length;
}
list.addEventListener("click", (e) => {
  const b = e.target.closest(".qty");
  if (!b) return;
  const it = getCart().find((i) => i.productId === b.dataset.id);
  setQty(it.productId, it.qty + Number(b.dataset.d));
});
window.addEventListener("cart:changed", render);
render();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!user) {
    location.href = "login.html?next=cart.html";
    return;
  }
  const f = new FormData(form);
  const info = {
    customerUID: user.uid,
    customerName: f.get("name").trim(),
    phone: f.get("phone").trim(),
    address: f.get("address").trim(),
    paymentMethod: "COD",
  };

  // Cart ko seller ke hisaab se baanto: har seller ka alag order banega
  const groups = {};
  for (const i of getCart()) {
    const key = i.sellerUID || "ags";
    groups[key] ||= { sellerName: i.sellerName || "Ankit General Store", items: [] };
    groups[key].items.push({
      productId: i.productId,
      name: i.name,
      price: i.price,
      qty: i.qty,
    });
  }

  btn.disabled = true;
  try {
    let grand = 0;
    let text = `Naya order (COD)\nNaam: ${info.customerName}\nPhone: ${info.phone}\nAddress: ${info.address}\n`;
    for (const [sellerUID, g] of Object.entries(groups)) {
      const totalAmount = g.items.reduce((s, i) => s + i.price * i.qty, 0);
      await placeOrder({
        ...info,
        sellerUID,
        sellerName: g.sellerName,
        items: g.items,
        totalAmount,
      });
      grand += totalAmount;
      text +=
        `\n[${g.sellerName}]\n` +
        g.items.map((i) => `${i.name} x${i.qty} = ₹${i.price * i.qty}`).join("\n");
    }
    text += `\n\nTotal: ₹${grand}`;
    clearCart();
    location.href = "https://wa.me/917617263817?text=" + encodeURIComponent(text);
  } catch (err) {
    alert("Order save nahi hua: " + err.message);
    btn.disabled = false;
  }
});