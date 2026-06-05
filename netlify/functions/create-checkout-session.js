const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getServiceClient } = require("./_supabase");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const ids = [...new Set(items.map((item) => String(item.id)).filter(Boolean))];

  if (ids.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Cart is empty" }),
    };
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .in("id", ids)
    .eq("sold", false);

  if (error) {
    return { statusCode: 500, body: error.message };
  }

  if (!data || data.length !== ids.length) {
    return {
      statusCode: 409,
      body: JSON.stringify({ error: "One or more items are no longer available" }),
    };
  }

  const lineItems = data.map((item) => ({
    price_data: {
      currency: "cad",
      product_data: { name: item.title },
      unit_amount: Math.round(Number(item.price) * 100),
    },
    quantity: 1,
  }));

  const siteUrl = process.env.URL || "https://retroloots.ca";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${siteUrl}/success.html`,
    cancel_url: `${siteUrl}/shop.html`,
    metadata: {
      itemIds: JSON.stringify(ids),
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ url: session.url }),
  };
};
