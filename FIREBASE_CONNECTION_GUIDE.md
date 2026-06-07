# 🔥 Firebase Connection Troubleshooting Guide for AGS

## ✅ Your Site is Already Built!

Great news! Your website (`i-anujsharma/ags`) already has **all the necessary pages and code**:
- ✅ Products page (products.html)
- ✅ Cart functionality (cart.html + cart.js)
- ✅ Login/Signup (login.html, signup.html)
- ✅ Admin panel (admin.html)
- ✅ Firebase integration (firebase.js, auth.js, products.js)

**The problem is likely a Firebase configuration issue, not missing code.**

---

## 🔧 Step 1: Verify Firebase Project Setup

Go to: **https://console.firebase.google.com/project/ankit-general-store-33443**

### ✅ Check: Authentication is Enabled
1. Click **Authentication** in left sidebar
2. Click **Sign-in method** tab
3. Verify **Email/Password** is **ENABLED** (green toggle)
4. If not enabled, click it and enable it

### ✅ Check: Firestore Database Exists
1. Click **Firestore Database** in left sidebar
2. You should see a database listed
3. **If not**, click **Create Database**:
   - Start in: **Production mode**
   - Location: **us-central1** (or closest to you)
   - Click **Create**

### ✅ Check: Firebase Config is Correct
1. Go to **Project Settings** (gear icon → Project Settings)
2. Scroll to **Your apps** section
3. Click on your web app (should show `ankit-general-store-33443`)
4. Copy the Firebase config
5. Compare it with `js/firebase.js` in your repo
   - The `apiKey`, `authDomain`, `projectId` should match
   - If different, update `js/firebase.js`

---

## 🌱 Step 2: Seed Sample Products (One-Time Setup)

### Option A: Use Admin Panel (Easiest)
1. Sign up/Login as admin (email: `anuj7harma@gmail.com`)
2. Go to **admin.html** on your site
3. Click **"🌱 Seed Sample Products"** button
4. Wait for confirmation message
5. Check **products.html** — products should now appear

### Option B: Use Browser Console
1. Open your site in browser (any page)
2. Press **F12** (open DevTools)
3. Click **Console** tab
4. Paste this code:

```javascript
import { db } from "./js/firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { SAMPLE_PRODUCTS } from "./js/products.js";

async function seedProducts() {
  const col = collection(db, "products");
  for (const p of SAMPLE_PRODUCTS) {
    await addDoc(col, { ...p, createdAt: serverTimestamp() });
    console.log("✅ Added:", p.name);
  }
  console.log("🎉 All products seeded!");
  window.location.reload();
}

seedProducts().catch(e => console.error("❌ Error:", e));
```

5. Press **Enter**
6. Wait a few seconds
7. Page will reload automatically
8. Refresh products.html to see products

---

## ❌ Troubleshooting Common Errors

### Error: "Cannot read properties of undefined (reading 'docs')"
**Cause**: Firestore database not created or not initialized

**Fix**:
- Go to Firebase Console
- Click "Firestore Database"
- If empty, click **Create Database**
- Select **Production mode** and **us-central1**
- Click **Create**

---

### Error: "Permission denied" when reading/writing
**Cause**: Firestore security rules blocking access

**Fix**:
- Check `firestore.rules` file in your repo
- Rules MUST allow:
  - ✅ `allow read: if true;` for products (public read)
  - ✅ Users: read/write own document only
  - ✅ Orders: read own orders or admin reads all

The rules should match the one in your repo. If you need to update:
1. Deploy rules via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

Or deploy via Firebase Console:
1. Go to **Firestore Database** → **Rules** tab
2. Paste the correct rules
3. Click **Publish**

---

### Error: "Products not showing on homepage"
**Cause**: No featured products in database OR Firestore not connected

**Fix**:
1. Seed products (see Step 2 above)
2. In admin panel, **edit at least 3 products**
3. Check the **⭐ Featured** checkbox
4. Save
5. Refresh homepage — featured products should appear

---

### Error: "Login/Signup failing with 'auth/invalid-api-key'"
**Cause**: Firebase API key misconfigured or expired

**Fix**:
1. Check `js/firebase.js` — verify all keys match Firebase Console
2. Regenerate API keys in Firebase Console:
   - Go to **Project Settings** → **Service Accounts** tab
   - Click **Node.js** → **Generate new private key**
3. Or use the Web App config directly:
   - Click your web app in **Your apps**
   - Copy the full config
   - Replace in `js/firebase.js`

---

### Error: "Module not found: firebase-app" or similar
**Cause**: Firebase SDK not loading from CDN

**Fix**:
- Ensure your page has internet connection
- Check that `js/firebase.js` imports from `https://www.gstatic.com/firebasejs/10.12.0/...`
- These are CDN URLs — they must load from the internet

---

## 🧪 Step 3: Test Firebase Connection

### Quick Test (Browser Console)
Press **F12**, click **Console**, paste:

```javascript
import { db } from "./js/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function testConnection() {
  try {
    const snap = await getDocs(collection(db, "products"));
    console.log("✅ Firebase Connected!");
    console.log("📦 Total products:", snap.docs.length);
    snap.docs.forEach(d => console.log("  •", d.data().name));
  } catch (e) {
    console.error("❌ Firebase Error:", e.message);
  }
}

testConnection();
```

**Expected output**:
- ✅ "Firebase Connected!"
- 📦 Shows product count
- Lists product names

**If you get an error**:
- Check Firebase Console for typos in config
- Verify Firestore Database exists
- Check security rules allow public product reads

---

## 📋 Complete Checklist

- [ ] Firebase project exists (ankit-general-store-33443)
- [ ] Firestore Database created (production mode)
- [ ] Authentication enabled (Email/Password)
- [ ] Firebase config in `js/firebase.js` is correct
- [ ] Security rules deployed (`firestore.rules`)
- [ ] Sample products seeded to database
- [ ] At least 3-4 products have `featured: true`
- [ ] Can view products on homepage
- [ ] Can sign up and create account
- [ ] Can login
- [ ] Can add products to cart
- [ ] Can order via WhatsApp

---

## 🚀 Deploy Your Site

### Option A: Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

Your site will be live at: `https://ankit-general-store-33443.firebaseapp.com`

### Option B: GitHub Pages
Push to GitHub and enable Pages in repo settings.

### Option C: Netlify / Vercel
Connect repo and deploy automatically.

---

## 📞 Still Having Issues?

1. **Check browser console** (F12 → Console tab)
   - Look for red error messages
   - Screenshot and share error details

2. **Check Firebase Console**
   - Go to **Firestore Database** → **Data** tab
   - Verify "products" collection exists
   - Verify products are listed inside

3. **Check network requests** (F12 → Network tab)
   - Look for failed requests to Firebase
   - Check if `firebaseapp.com` requests are blocked

4. **Common fixes**:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+Shift+R)
   - Try in incognito/private mode
   - Try different browser

---

## 🎯 Quick Start Script

Run this in Firebase Console → **Firestore Database** → **+ Add collection**:

1. Create collection: `products`
2. Add document with sample data:
```json
{
  "name": "Basmati Rice (5 kg)",
  "category": "Grocery",
  "price": 350,
  "stock": 50,
  "description": "Premium quality long-grain basmati rice.",
  "featured": true,
  "imageURL": "",
  "createdAt": "[Current timestamp]"
}
```

Repeat 2-3 more times with different products.

---

**Last Updated**: January 2025  
**Firebase SDK**: v10.12.0 (CDN)  
**Project**: ankit-general-store-33443
