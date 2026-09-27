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

const shippingOptions = {
  "5":  { name: "Standard Shipping (3–7 days)", amount: 5 },
  "10": { name: "Express Shipping (1–3 days)",  amount: 10 }
};

const promoCodes = { "EMBER10": 10 };

const currency = "usd";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const order = await req.json();
  const site = new URL(req.url).origin;
  const percent = promoCodes[order.promo] || 0;
  const shipping = shippingOptions[order.shipping] || shippingOptions["5"];

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `${site}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${site}/checkout.html`);
  params.append("customer_email", order.email);

  let i = 0;
  for (const item of order.cart) {
    const product = products[item.id];
    if (!product || !product.prices[item.size]) continue;

    const qty = Math.min(10, Math.max(1, Math.floor(Number(item.qty)) || 1));
    const cents = product.prices[item.size] * (100 - percent);

    params.append(`line_items[${i}][price_data][currency]`, currency);
    params.append(`line_items[${i}][price_data][product_data][name]`, `${product.name} (${item.size.replace("g", " g")})`);
    params.append(`line_items[${i}][price_data][unit_amount]`, String(cents));
    params.append(`line_items[${i}][quantity]`, String(qty));
    i++;
  }

  if (i === 0) {
    return Response.json({ error: "Your cart is empty." }, { status: 400 });
  }

  params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.append("shipping_options[0][shipping_rate_data][display_name]", shipping.name);
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(shipping.amount * 100));
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", currency);

  params.append("payment_intent_data[shipping][name]", order.name);
  params.append("payment_intent_data[shipping][phone]", order.phone);
  params.append("payment_intent_data[shipping][address][line1]", order.address);
  params.append("payment_intent_data[shipping][address][city]", order.city);
  params.append("payment_intent_data[shipping][address][postal_code]", order.postalCode);
  params.append("payment_intent_data[shipping][address][country]", order.country);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const session = await response.json();

  if (!response.ok) {
    return Response.json({ error: session.error?.message || "Payment error" }, { status: 500 });
  }

  return Response.json({ url: session.url });
};
