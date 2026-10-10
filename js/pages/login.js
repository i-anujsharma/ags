import { mountLayout } from "../ui/layout.js";
import { login, signup } from "../services/db.js";
mountLayout();
const next = new URLSearchParams(location.search).get("next") || "index.html";
const msg = document.getElementById("msg");
const go = async (fn) => {
  try {
    await fn();
    location.href = next;
  } catch (e) {
    msg.textContent = e.message.replace("Firebase: ", "");
  }
};
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  go(() => login(f.get("email"), f.get("password")));
});
document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  go(() =>
    signup(
      f.get("name").trim(),
      f.get("phone").trim(),
      f.get("email"),
      f.get("password"),
    ),
  );
});
