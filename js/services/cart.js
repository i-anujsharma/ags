// Cart service: sirf yahi file localStorage cart ko touch karti hai.
const KEY = "ags_cart";
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};
const write = (items) => {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
};

export const getCart = read;
export const cartCount = () => read().reduce((n, i) => n + i.qty, 0);
export const cartTotal = () => read().reduce((s, i) => s + i.price * i.qty, 0);

export function addToCart(p, stock = Infinity) {
  const items = read();
  const found = items.find((i) => i.productId === p.id);
  if (found) {
    if (found.qty < stock) found.qty += 1;
  } else
    items.push({
      productId: p.id,
      name: p.name,
      price: p.price,
      qty: 1,
      sellerUID: p.sellerUID || "ags",
      sellerName: p.sellerName || "Ankit General Store",
    });
  write(items);
}
export function setQty(productId, qty) {
  write(
    read()
      .map((i) => (i.productId === productId ? { ...i, qty } : i))
      .filter((i) => i.qty > 0),
  );
}
export function clearCart() {
  write([]);
}