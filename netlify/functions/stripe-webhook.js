const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getServiceClient } = require("./_supabase");

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: err.message };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const itemIds = JSON.parse(session.metadata.itemIds || "[]");
    const supabase = getServiceClient();

    if (itemIds.length > 0) {
      const { error: inventoryError } = await supabase
        .from("inventory")
        .update({ sold: true })
        .in("id", itemIds)
        .eq("sold", false);

      if (inventoryError) {
        return { statusCode: 500, body: inventoryError.message };
      }
    }

    const { error: orderError } = await supabase.from("orders").insert({
      stripe_session: session.id,
      total: Number(session.amount_total || 0) / 100,
      items: itemIds,
    });

    if (orderError) {
      return { statusCode: 500, body: orderError.message };
    }
  }

  return { statusCode: 200, body: "OK" };
};
