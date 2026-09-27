const products = {
  "vanilla-bliss":  { name: "Vanilla Bliss",  prices: { "180g": 18, "300g": 24 } },
  "amber-wood":     { name: "Amber Wood",     prices: { "180g": 20, "300g": 26 } },
  "cedar-escape":   { name: "Cedar Escape",   prices: { "180g": 18, "300g": 24 } },
  "rose-garden":    { name: "Rose Garden",    prices: { "180g": 16, "300g": 22 } },
  "citrus-bloom":   { name: "Citrus Bloom",   prices: { "180g": 18, "300g": 24 } },
  "forest-night":   { name: "Forest Night",   prices: { "180g": 20, "300g": 26 } },
  "ocean-breeze":   { name: "Ocean Breeze",   prices: { "180g": 18, "300g": 24 } },
  "lavender-calm":  { name: "Lavender Calm",  prices: { "180g": 16, "300g": 22 } },
  "coffee-mood":    { name: "Coffee Mood",    prices: { "180g": 18, "300g": 24 } },
  "honey-glow":     { name: "Honey Glow",     prices: { "180g": 18, "300g": 24 } },
  "sea-salt-sage":  { name: "Sea Salt Sage",  prices: { "180g": 20, "300g": 26 } },
  "cherry-blossom": { name: "Cherry Blossom", prices: { "180g": 16, "300g": 22 } },
  "pine-cabin":     { name: "Pine Cabin",     prices: { "180g": 20, "300g": 26 } },
  "lemon-grove":    { name: "Lemon Grove",    prices: { "180g": 16, "300g": 22 } },
  "fig-cassis":     { name: "Fig & Cassis",   prices: { "180g": 22, "300g": 28 } },
  "white-tea":      { name: "White Tea",      prices: { "180g": 18, "300g": 24 } },
  "smoked-oak":     { name: "Smoked Oak",     prices: { "180g": 22, "300g": 28 } },
  "peony-dreams":   { name: "Peony Dreams",   prices: { "180g": 18, "300g": 24 } },
  "autumn-spice":   { name: "Autumn Spice",   prices: { "180g": 20, "300g": 26 } },
  "cotton-linen":   { name: "Cotton Linen",   prices: { "180g": 16, "300g": 22 } }
};

const promoCodes = { "EMBER10": 10 };

function money(amount) {
  return "$" + (Number.isInteger(amount) ? amount : amount.toFixed(2));
}
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateBadge();
}
function updateBadge() {
  const badge = document.querySelector(".badge");
  if (!badge) return;

  let count = 0;
  for (const item of getCart()) {
    count += item.qty;
  }

  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

updateBadge();
function addToCart(id, size, qty) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id && item.size === size);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: id, size: size, qty: qty });
  }

  saveCart(cart);
}
const productForm = document.querySelector(".add-to-cart");

if (productForm) {
  const qtyInput = productForm.querySelector('input[name="quantity"]');
  const [minusBtn, plusBtn] = productForm.querySelectorAll(".quantity button");

  minusBtn.addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });

  plusBtn.addEventListener("click", () => {
    qtyInput.value = Math.min(10, Number(qtyInput.value) + 1);
  });

  productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const size = productForm.querySelector('input[name="size"]:checked').value;
    const qty = Number(qtyInput.value);
    addToCart(productForm.dataset.id, size, qty);

    const button = productForm.querySelector(".cart-btn");
    button.textContent = "Added ✓";
    setTimeout(() => { button.textContent = "Add to Cart"; }, 1500);
  });
}
const cartList = document.querySelector(".cart-items");

if (cartList) {
  renderCart();

  cartList.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const cart = getCart();
    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (action === "plus")   cart[index].qty = Math.min(10, cart[index].qty + 1);
    if (action === "minus")  cart[index].qty = Math.max(1, cart[index].qty - 1);
    if (action === "remove") cart.splice(index, 1);

    saveCart(cart);
    renderCart();
  });

  cartList.addEventListener("change", (event) => {
    const cart = getCart();
    const index = Number(event.target.dataset.index);
    cart[index].qty = Math.min(10, Math.max(1, Number(event.target.value) || 1));
    saveCart(cart);
    renderCart();
  });
}
function renderCart() {
  const cart = getCart();
  cartList.innerHTML = "";

  let subtotal = 0;
  let count = 0;

  cart.forEach((item, index) => {
    const product = products[item.id];
    const linePrice = product.prices[item.size] * item.qty;
    subtotal += linePrice;
    count += item.qty;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <a href="${item.id}.html"><img src="${item.id}.jpg" alt="${product.name} candle"></a>
      <div class="cart-item-info">
        <h2><a href="${item.id}.html">${product.name}</a></h2>
        <p class="cart-item-size">${item.size.replace("g", " g")}</p>
      </div>
      <div class="quantity">
        <button type="button" data-action="minus" data-index="${index}" aria-label="Decrease quantity">−</button>
        <input type="number" value="${item.qty}" min="1" max="10" data-index="${index}" aria-label="Quantity for ${product.name}">
        <button type="button" data-action="plus" data-index="${index}" aria-label="Increase quantity">+</button>
      </div>
      <p class="cart-item-price">${money(linePrice)}</p>
      <button type="button" class="remove-btn" data-action="remove" data-index="${index}" aria-label="Remove ${product.name}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </button>`;
    cartList.appendChild(li);
  });

  const code = localStorage.getItem("promo");
  const percent = promoCodes[code] || 0;
  const discount = subtotal * percent / 100;

  document.querySelector("#subtotal").textContent = money(subtotal);
  document.querySelector("#discount").textContent = "−" + money(discount);
  document.querySelector("#discount-row").hidden = discount === 0;
  document.querySelector("#total").textContent = money(subtotal - discount);

  document.querySelector(".cart-count").textContent = `(${count} ${count === 1 ? "item" : "items"})`;
  document.querySelector(".cart-empty").hidden = cart.length > 0;
  document.querySelector(".cart-content").hidden = cart.length === 0;
}
const promoForm = document.querySelector(".promo");

if (promoForm) {
  promoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const code = document.querySelector("#promo-code").value.trim().toUpperCase();
    const message = document.querySelector("#promo-message");

    if (promoCodes[code]) {
      localStorage.setItem("promo", code);
      message.textContent = `Code ${code} applied: ${promoCodes[code]}% off!`;
    } else {
      message.textContent = "Sorry, that code doesn't work.";
    }

    renderCart();
  });
}