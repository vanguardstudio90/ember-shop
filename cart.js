const products = {
  "vanilla-bliss":  { name: "Vanilla Bliss",  image: "images/cream-vanilla.png",    prices: { "300g": 24 } },
  "amber-wood":     { name: "Amber Wood",     image: "images/amber-wood.png",       prices: { "300g": 26 } },
  "cedar-escape":   { name: "Cedar Escape",   image: "images/brown-cedar.png",      prices: { "300g": 24 } },
  "rose-garden":    { name: "Rose Garden",    image: "images/green-rose.png",       prices: { "300g": 22 } },
  "citrus-bloom":   { name: "Citrus Bloom",   image: "images/pink-citrus.png",      prices: { "300g": 24 } },
  "forest-night":   { name: "Forest Night",   image: "images/green-forest.png",     prices: { "300g": 26 } },
  "ocean-breeze":   { name: "Ocean Breeze",   image: "images/dark-blue-ocean.png",  prices: { "300g": 24 } },
  "lavender-calm":  { name: "Lavender Calm",  image: "images/lavender.png",         prices: { "300g": 22 } },
  "coffee-mood":    { name: "Coffee Mood",    image: "images/cream-coffee.png",     prices: { "300g": 24 } },
  "honey-glow":     { name: "Honey Glow",     image: "images/cream-honey.png",      prices: { "300g": 24 } },
  "sea-salt-sage":  { name: "Sea Salt Sage",  image: "images/blue-salt.png",        prices: { "300g": 26 } },
  "cherry-blossom": { name: "Cherry Blossom", image: "images/cherry.png",           prices: { "300g": 22 } },
  "pine-cabin":     { name: "Pine Cabin",     image: "images/black-pine.png",       prices: { "300g": 26 } },
  "lemon-grove":    { name: "Lemon Grove",    image: "images/brown-lemon.png",      prices: { "300g": 22 } },
  "fig-cassis":     { name: "Fig & Cassis",   image: "images/cream-fig.png",        prices: { "300g": 28 } },
  "white-tea":      { name: "White Tea",      image: "images/blue-white.png",       prices: { "300g": 24 } },
  "smoked-oak":     { name: "Smoked Oak",     image: "images/brown-oak.png",        prices: { "300g": 28 } },
  "peony-dreams":   { name: "Peony Dreams",   image: "images/cream-peony.png",      prices: { "300g": 24 } },
  "autumn-spice":   { name: "Autumn Spice",   image: "images/cream-autumn.png",     prices: { "300g": 26 } },
  "cotton-linen":   { name: "Cotton Linen",   image: "images/gray-cotton.png",      prices: { "300g": 22 } }
};

const promoCodes = { "EMBER10": 10 };

function money(amount) {
  return "$" + (Number.isInteger(amount) ? amount : amount.toFixed(2));
}

function colorName(color) {
  return color ? (color.charAt(0).toUpperCase() + color.slice(1)).replace("-", " ") : "";
}

function itemImage(item, product) {
  return item.image ? "images/" + item.image : product.image;
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

function addToCart(id, size, color, image, qty) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id && item.size === size && item.color === color);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: id, size: size, color: color, image: image, qty: qty });
  }

  saveCart(cart);
}

const productForm = document.querySelector(".add-to-cart");

if (productForm) {
  const qtyInput = productForm.querySelector('input[name="quantity"]');
  const [minusBtn, plusBtn] = productForm.querySelectorAll(".quantity button");
  const mainImage = document.querySelector(".main-image");

  minusBtn.addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });

  plusBtn.addEventListener("click", () => {
    qtyInput.value = Math.min(10, Number(qtyInput.value) + 1);
  });

  productForm.querySelectorAll('input[name="color"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      mainImage.src = "../images/" + radio.dataset.image;
    });
  });

  productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const size = productForm.querySelector('input[name="size"]:checked').value;
    const colorInput = productForm.querySelector('input[name="color"]:checked');
    const qty = Number(qtyInput.value);
    addToCart(productForm.dataset.id, size, colorInput.value, colorInput.dataset.image, qty);

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
    if (!product) return;
    const linePrice = product.prices[item.size] * item.qty;
    subtotal += linePrice;
    count += item.qty;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <a href="product-pages/${item.id}.html"><img src="${itemImage(item, product)}" alt="${colorName(item.color)} ${product.name} candle"></a>
      <div class="cart-item-info">
        <h2><a href="product-pages/${item.id}.html">${product.name}</a></h2>
        <p class="cart-item-size">${item.size.replace("g", " g")}${item.color ? ", " + colorName(item.color) : ""}</p>
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

  const percent = promoCodes[localStorage.getItem("promo")] || 0;
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

const checkoutForm = document.querySelector("#checkout-form");

if (checkoutForm) {
  if (getCart().length === 0) {
    window.location.href = "cart.html";
  }

  renderSummary();
  checkoutForm.addEventListener("change", renderSummary);

  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = document.querySelector('button[form="checkout-form"]');
    button.disabled = true;
    button.textContent = "Taking you to payment...";

    const data = new FormData(checkoutForm);
    const order = {
      cart: getCart(),
      promo: localStorage.getItem("promo"),
      shipping: data.get("shipping"),
      email: data.get("email"),
      name: data.get("first-name") + " " + data.get("last-name"),
      phone: data.get("phone"),
      address: data.get("address"),
      city: data.get("city"),
      postalCode: data.get("postal-code"),
      country: data.get("country")
    };

    try {
      const response = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      window.location.href = result.url;
    } catch (error) {
      alert("Something went wrong: " + error.message);
      button.disabled = false;
      button.textContent = "Place Order";
    }
  });
}

function renderSummary() {
  const cart = getCart();
  const list = document.querySelector(".summary-items");
  list.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const product = products[item.id];
    if (!product) return;
    const linePrice = product.prices[item.size] * item.qty;
    subtotal += linePrice;

    const li = document.createElement("li");
    li.className = "summary-item";
    li.innerHTML = `
      <img src="${itemImage(item, product)}" alt="">
      <div>
        <p class="summary-name">${product.name}</p>
        <p class="summary-detail">${item.size.replace("g", " g")}${item.color ? ", " + colorName(item.color) : ""} × ${item.qty}</p>
      </div>
      <p class="summary-price">${money(linePrice)}</p>`;
    list.appendChild(li);
  });

  const percent = promoCodes[localStorage.getItem("promo")] || 0;
  const discount = subtotal * percent / 100;
  const shipping = Number(checkoutForm.querySelector('input[name="shipping"]:checked').value);

  document.querySelector("#checkout-subtotal").textContent = money(subtotal);
  document.querySelector("#checkout-discount").textContent = "−" + money(discount);
  document.querySelector("#checkout-discount-row").hidden = discount === 0;
  document.querySelector("#checkout-shipping").textContent = money(shipping);
  document.querySelector("#checkout-total").textContent = money(subtotal - discount + shipping);
}

if (new URLSearchParams(window.location.search).has("session_id")) {
  localStorage.removeItem("cart");
  localStorage.removeItem("promo");
  updateBadge();
}

const grid = document.querySelector(".product-grid");
const filterForm = document.querySelector(".filters form");

if (grid && filterForm) {
  const cards = Array.from(grid.querySelectorAll(".product-card"));
  const sortSelect = document.querySelector("#sort");
  const searchInput = document.querySelector("#search");
  const minRange = filterForm.querySelector('input[name="min-price"]');
  const maxRange = filterForm.querySelector('input[name="max-price"]');
  const minLabel = document.querySelector("#min-price-label");
  const maxLabel = document.querySelector("#max-price-label");
  const noResults = document.querySelector(".no-results");

  function applyFilters() {
    const scents = Array.from(filterForm.querySelectorAll('input[name="scent"]:checked')).map(box => box.value);
    const colors = Array.from(filterForm.querySelectorAll('input[name="color"]:checked')).map(box => box.value);
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    let min = Number(minRange.value);
    let max = Number(maxRange.value);
    if (min > max) [min, max] = [max, min];

    minLabel.textContent = "$" + min;
    maxLabel.textContent = "$" + max;

    let shown = 0;
    cards.forEach((card) => {
      const price = Number(card.dataset.price);
      const cardColors = card.dataset.colors.split(" ");
      const name = card.querySelector("h2").textContent.toLowerCase();

      const scentOk = scents.length === 0 || scents.includes(card.dataset.scent);
      const colorOk = colors.length === 0 || colors.some(color => cardColors.includes(color));
      const priceOk = price >= min && price <= max;
      const searchOk = query === "" || name.includes(query) || card.dataset.scent.includes(query) || card.dataset.colors.includes(query);

      const show = scentOk && colorOk && priceOk && searchOk;
      card.style.display = show ? "" : "none";
      if (show) shown++;
    });

    noResults.hidden = shown > 0;

    const sorted = [...cards];
    if (sortSelect.value === "price-asc")  sorted.sort((a, b) => a.dataset.price - b.dataset.price);
    if (sortSelect.value === "price-desc") sorted.sort((a, b) => b.dataset.price - a.dataset.price);
    if (sortSelect.value === "newest")     sorted.reverse();
    sorted.forEach(card => grid.appendChild(card));
  }

  filterForm.addEventListener("input", applyFilters);
  sortSelect.addEventListener("change", applyFilters);
  filterForm.addEventListener("reset", () => {
    if (searchInput) searchInput.value = "";
    setTimeout(applyFilters, 0);
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
    if (window.location.hash === "#search") {
      searchInput.focus();
    }
  }

  applyFilters();
}

const heartIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;

const wishlistGrid = document.querySelector(".wishlist-grid");

function getLiked() {
  return JSON.parse(localStorage.getItem("liked") || "[]");
}

function saveLiked(liked) {
  localStorage.setItem("liked", JSON.stringify(liked));
}

function updateHearts() {
  const liked = getLiked();
  document.querySelectorAll(".like-btn").forEach((btn) => {
    const isLiked = liked.includes(btn.dataset.id);
    btn.classList.toggle("liked", isLiked);
    btn.setAttribute("aria-pressed", isLiked);
    btn.setAttribute("aria-label", isLiked ? "Remove from wishlist" : "Add to wishlist");
  });
}

function renderWishlist() {
  const liked = getLiked().filter(id => products[id]);
  wishlistGrid.innerHTML = "";

  liked.forEach((id) => {
    const product = products[id];
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="image-wrap">
        <a href="product-pages/${id}.html"><img src="${product.image}" alt="${product.name} candle"></a>
        <button class="like-btn" data-id="${id}">${heartIcon}</button>
      </div>
      <h2><a href="product-pages/${id}.html">${product.name}</a></h2>
      <p class="price">${money(product.prices["300g"])}</p>
      <a class="wishlist-btn" href="product-pages/${id}.html">Choose color</a>`;
    wishlistGrid.appendChild(card);
  });

  document.querySelector(".wishlist-count").textContent = `(${liked.length})`;
  document.querySelector(".wishlist-empty").hidden = liked.length > 0;
  updateHearts();
}

document.addEventListener("click", (event) => {
  const btn = event.target.closest(".like-btn");
  if (!btn) return;
  event.preventDefault();

  const liked = getLiked();
  const id = btn.dataset.id;
  const index = liked.indexOf(id);

  if (index === -1) {
    liked.push(id);
  } else {
    liked.splice(index, 1);
  }

  saveLiked(liked);
  if (wishlistGrid) {
    renderWishlist();
  } else {
    updateHearts();
  }
});

if (wishlistGrid) {
  renderWishlist();
} else {
  updateHearts();
}

document.documentElement.classList.add("js");

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}
const menuBtn = document.querySelector(".menu-btn");
const mainMenu = document.querySelector("#main-menu");

if (menuBtn && mainMenu) {
  menuBtn.addEventListener("click", () => {
    const isOpen = mainMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", isOpen);
    menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}
const footer = document.querySelector("footer");

if (footer) {
  const base = window.location.pathname.includes("/product-pages/") ? "../" : "";
  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="footer-top">
      <div class="footer-brand">
        <a href="${base}index.html" class="logo"><p class="logo-text">Ember</p></a>
        <p>Handmade soy candles inspired by nature, for a calmer, cozier home.</p>
        <div class="footer-social">
          <a href="#" aria-label="Ember on Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
          <a href="#" aria-label="Ember on Facebook"><i class="fa-brands fa-facebook" aria-hidden="true"></i></a>
          <a href="#" aria-label="Ember on TikTok"><i class="fa-brands fa-tiktok" aria-hidden="true"></i></a>
          <a href="#" aria-label="Ember on Pinterest"><i class="fa-brands fa-pinterest" aria-hidden="true"></i></a>
        </div>
      </div>

      <nav class="footer-col" aria-label="Shop">
        <h2>Shop</h2>
        <a href="${base}all.html">All Candles</a>
        <a href="${base}wishlist.html">Wishlist</a>
        <a href="${base}cart.html">Cart</a>
      </nav>

      <nav class="footer-col" aria-label="About Ember">
        <h2>Ember</h2>
        <a href="${base}about.html">Our Story</a>
        <a href="${base}contact.html">Contact</a>
        <a href="${base}contact.html">Shipping &amp; Returns</a>
      </nav>

      <div class="footer-col">
        <h2>Get in touch</h2>
        <a href="mailto:hello@embercandles.com">hello@embercandles.com</a>
        <a href="tel:+48123456789">+48 123 456 789</a>
        <p>Warsaw, Poland</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; ${year} Ember. All rights reserved.</p>
      <p>Secure payments by Stripe</p>
    </div>`;
}