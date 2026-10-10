import { mountLayout, esc } from "../ui/layout.js";
import { onUser, myOrders } from "../services/db.js";
mountLayout();
const box = document.getElementById("orders");
onUser(async (u) => {
  if (!u) {
    box.innerHTML = `<p class="empty">Orders dekhne ke liye <a href="login.html?next=orders.html">login karo</a>.</p>`;
    return;
  }
  try {
    const os = await myOrders(u.uid);
    box.innerHTML = os.length
      ? os
          .map(
            (o) => `
      <article class="card order"><div class="card-tag">${o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleString("en-IN") : ""}</div>
      <p><span class="status">${esc(o.status)}</span> · ₹${o.totalAmount}</p>
      <p>${o.items.map((i) => esc(i.name) + " x" + i.qty).join(", ")}</p></article>`,
          )
          .join("")
      : `<p class="empty">Abhi koi order nahi.</p>`;
  } catch (e) {
    box.innerHTML = `<p class="empty">Orders load nahi hue.</p>`;
    console.error(e);
  }
});
