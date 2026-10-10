import { cartCount } from "../services/cart.js";
import { onUser, logout } from "../services/db.js";

export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

export function mountLayout() {
  document.getElementById("site-header").innerHTML = `
<header class="site-header">
  <a class="brand" href="index.html"><span class="brand-mark">AGS</span><span class="brand-name">Ankit General Store</span></a>
  <nav class="nav" aria-label="Main">
    <a href="index.html">Home</a><a href="orders.html">My orders</a>
    <a href="login.html" id="auth-link">Login</a>
    <a href="cart.html">Cart <span id="cart-count" class="badge">0</span></a>
  </nav>
</header>`;
  document.getElementById("site-footer").innerHTML = `
<footer class="site-footer"><p><strong>Ankit General Store</strong> · RARI, Mihona</p>
<p>Call <a href="tel:+917617263817">7617263817</a> or <a href="https://wa.me/917617263817">WhatsApp us</a></p></footer>`;
  const paint = () => {
    document.getElementById("cart-count").textContent = cartCount();
  };
  paint();
  window.addEventListener("cart:changed", paint);
  const a = document.getElementById("auth-link");
  onUser((u) => {
    if (u) {
      a.textContent = "Logout";
      a.href = "#";
      a.onclick = async (e) => {
        e.preventDefault();
        await logout();
        location.href = "index.html";
      };
    }
  });
}
