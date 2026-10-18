# AGS — Ankit General Store

A mobile-friendly e-commerce website for a neighbourhood general store in RARI, Mihona (Madhya Pradesh).
Customers browse products, add them to a cart and place a Cash-on-Delivery order that is saved to Firestore
and sent to the store on WhatsApp. The store owner manages everything from an admin panel, and other
local shops can join as **sellers** and sell through the same website.

**Live site:** https://i-anujsharma.github.io/ags/

Built with plain HTML, CSS and JavaScript (ES modules) and Firebase. There is no build step.

---

## Features

### Customers
- Browse products, filter by category, search by product name or brand
- Product detail page with a photo gallery, price, MRP and discount, highlights, description and specifications
- Cart with quantity controls that is saved between visits
- Sign up, log in, log out and **forgot password** (reset link by email)
- Checkout with Cash on Delivery; the order is saved and a WhatsApp message is prepared
- "My orders" page to track order status

### Admin (store owner)
- Add, edit and delete products with multiple photos, MRP, brand, unit, description, highlights and specifications
- View every order and update its status
- Approve or reject seller applications

### Sellers (other shops)
- Apply from the **Sell on AGS** page and wait for admin approval
- Own dashboard to manage only their products
- See and update status of orders that contain their products
- A cart with items from several sellers is automatically split into one order per seller

### Design
- Neumorphism (soft UI) theme with smooth animations
- Respects the "reduce motion" setting on phones and computers

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, vanilla JavaScript (ES modules) |
| Authentication | Firebase Authentication (email and password) |
| Database | Cloud Firestore |
| Hosting | GitHub Pages (Firebase Hosting also works) |
| Fonts | Outfit and Mukta (Google Fonts) |

---

## Project structure

```
ags/
├── index.html            Storefront (search, categories, product grid)
├── product.html          Product detail page
├── cart.html             Cart and checkout
├── login.html            Login, sign up, forgot password
├── orders.html           Customer's own orders
├── seller.html           Seller application and seller dashboard
├── admin.html            Admin panel
├── products.html         Redirects to index.html
├── firestore.rules       Firestore security rules (paste into Firebase console)
├── schema.md             Data contract: final Firestore field names
├── css/
│   └── base.css          Theme and all styles
└── js/
    ├── firebase-config.js    Your Firebase web config
    ├── services/
    │   ├── db.js             All Firebase calls (auth + Firestore)
    │   └── cart.js           Cart stored in localStorage
    ├── ui/
    │   ├── layout.js         Shared header, footer and helpers
    │   └── productForm.js    Product form used by admin and sellers
    └── pages/                One script per page
```

All Firebase calls live in `js/services/db.js`, and Firestore field names are listed in `schema.md`.
Keep both in sync when you change the data.

---

## Getting started

### 1. Get the code
```bash
git clone https://github.com/i-anujsharma/ags.git
cd ags
```

### 2. Create a Firebase project
1. Open the [Firebase console](https://console.firebase.google.com) and create a project.
2. **Project settings → Your apps → Add app → Web (`</>`)**, then copy the config.
3. Paste the values into `js/firebase-config.js`:
   ```js
   export const firebaseConfig = {
     apiKey: "...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     appId: "..."
   };
   ```
   This config is not a secret. Security comes from the Firestore rules.

### 3. Turn on Authentication
**Authentication → Sign-in method → Email/Password → Enable → Save.**

### 4. Create Firestore and publish the rules
1. **Firestore Database → Create database** (production mode).
2. Open the **Rules** tab, replace everything with the content of `firestore.rules` and press **Publish**.

### 5. Make yourself the admin
1. Open the site, sign up with your email, then copy your **User UID** from **Authentication → Users**.
2. In **Firestore → Data**, create a collection named `admins`.
3. Add a document whose **Document ID is your UID** (it needs one field, for example `role: "admin"`).
4. Log in again. An **Admin** link appears in the header and `admin.html` opens.

### 6. Run it locally
Use the VS Code **Live Server** extension and open `index.html`.
Do not open the file with a double-click (`file://`), because ES modules need a server.

### 7. Deploy to GitHub Pages
1. Push the code to GitHub.
2. **Settings → Pages → Branch: `main`, folder: `/ (root)` → Save.**
3. In Firebase, go to **Authentication → Settings → Authorized domains** and add `<your-username>.github.io`.
   Without this, login does not work on the live site.

---

## Data model

| Collection | Purpose | Main fields |
|---|---|---|
| `products` | Items for sale | name, brand, category, unit, price, mrp, stock, shortDesc, description, highlights[], specs[], images[], imageUrl, active, sellerUID, sellerName |
| `orders` | One order per seller per checkout | customerUID, customerName, phone, address, items[], totalAmount, status, paymentMethod, sellerUID, sellerName, createdAt |
| `users` | Customer profile | name, phone, createdAt |
| `sellers` | Seller applications | shopName, phone, status (`pending`, `approved`, `rejected`), createdAt |
| `admins` | Document ID is the admin's UID | (no fields needed) |

Order status flow: `placed` → `confirmed` → `out_for_delivery` → `delivered` (or `cancelled`).
Products owned by the store use `sellerUID: "ags"`. See `schema.md` for the full contract.

---

## Security

- Customers can read only active products, create orders for themselves and read only their own orders.
- Only an admin can approve sellers and manage all products and orders.
- An approved seller can change only their own products and only the **status** of their own orders.
- Admin access is decided by a document in the `admins` collection that clients cannot write, so roles are never stored in an editable profile.
- User-entered text is escaped before it is shown on a page.

**Known limits**
- The order total is calculated in the browser and the rules only check that it is a positive number. This is fine for Cash on Delivery because the store confirms orders by phone. Before adding online payments, validate totals on a trusted backend such as Cloud Functions.
- Stock is not reduced automatically after an order. Update it from the admin or seller dashboard.
- Product photos are added as image links. Uploading from a phone needs a storage service such as Cloudinary, or Firebase Storage on a paid plan.

---

## Roadmap
- [ ] Photo upload from the device (Cloudinary)
- [ ] Automatic stock reduction after an order
- [ ] Server-side order total validation
- [ ] Online payments (UPI)
- [ ] Coupons and discounts
- [ ] Sales reports for admin and sellers

---

## Author

**Anuj Sharma** — owner of Ankit General Store, B.Tech CSE student.
GitHub: [@i-anujsharma](https://github.com/i-anujsharma)