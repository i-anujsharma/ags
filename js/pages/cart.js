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
  const f = new FormData(form),
    items = getCart();
  const o = {
    customerUID: user.uid,
    customerName: f.get("name").trim(),
    phone: f.get("phone").trim(),
    address: f.get("address").trim(),
    items,
    totalAmount: cartTotal(),
    paymentMethod: "COD",
  };
  btn.disabled = true;
  try {
    await placeOrder(o);
    clearCart();
    const msg =
      `Naya order (COD)\nNaam: ${o.customerName}\nPhone: ${o.phone}\nAddress: ${o.address}\n\n` +
      items.map((i) => `${i.name} x${i.qty} = ₹${i.price * i.qty}`).join("\n") +
      `\n\nTotal: ₹${o.totalAmount}`;
    location.href = "https://wa.me/917617263817?text=" + encodeURIComponent(msg);
  } catch (err) {
    alert("Order save nahi hua: " + err.message);
    btn.disabled = false;
  }
});
