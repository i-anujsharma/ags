import { mountLayout } from "../ui/layout.js";
import { login, signup, resetPassword } from "../services/db.js";

mountLayout();

const next = new URLSearchParams(location.search).get("next") || "index.html";
const msg = document.getElementById("msg");

// Firebase error codes ko simple Hinglish messages mein badalte hain
const ERRORS = {
  "auth/email-already-in-use": "Ye email pehle se registered hai. Upar wale form se Login karo.",
  "auth/invalid-credential": "Email ya password galat hai.",
  "auth/weak-password": "Password kam se kam 6 character ka rakho.",
  "auth/invalid-email": "Email sahi format mein daalo.",
  "auth/too-many-requests": "Bahut zyada try ho gaye. Thodi der baad dobara karo.",
  "permission-denied": "Account ban gaya, par profile save nahi hui. Firestore rules publish karo.",
};

// Message dikhao: ok=true to green, warna red
function show(text, ok = false) {
  msg.textContent = text;
  msg.className = ok ? "ok" : "err";
  msg.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function run(form, successText, action) {
  const btn = form.querySelector("button");
  btn.disabled = true;
  show("Please wait...", true);
  try {
    await action();
    show(successText, true);
    setTimeout(() => (location.href = next), 1500);
  } catch (e) {
    console.error(e);
    show(ERRORS[e.code] || e.message);
    btn.disabled = false;
  }
}

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  run(e.target, "Login ho gaya! Redirect ho raha hai...", () =>
    login(f.get("email"), f.get("password")),
  );
});

document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  run(e.target, "Account ban gaya! Redirect ho raha hai...", () =>
    signup(f.get("name").trim(), f.get("phone").trim(), f.get("email"), f.get("password")),
  );
});

// Forgot password: email login form se lo (khaali ho to signup form ka email)
const forgotBtn = document.getElementById("forgot");
forgotBtn.addEventListener("click", async () => {
  console.log("Forgot password clicked");
  const email = (
    document.querySelector('#login-form [name="email"]').value ||
    document.querySelector('#signup-form [name="email"]').value
  ).trim();
  if (!email) {
    show("Pehle Email wali jagah apna email likho, phir 'Forgot password?' dabao.");
    return;
  }
  forgotBtn.disabled = true;
  show("Reset link bhej raha hu: " + email + " ...", true);
  try {
    await resetPassword(email);
    console.log("Reset request OK for", email);
    show(
      "Reset link bhej diya gaya hai (" +
        email +
        "). Inbox aur Spam dono check karo. " +
        "Agar 2-3 minute mein na aaye to wo email registered nahi hai.",
      true,
    );
  } catch (e) {
    console.error("Reset failed:", e.code, e.message);
    show(ERRORS[e.code] || "Error: " + (e.code || e.message));
  }
  setTimeout(() => (forgotBtn.disabled = false), 10000);
});