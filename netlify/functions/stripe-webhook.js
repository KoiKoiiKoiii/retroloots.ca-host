const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];

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

if (stripeEvent.type === 'checkout.session.completed') {
  const session = stripeEvent.data.object;

  const itemIds = JSON.parse(session.metadata.itemIds || "[]");

  // 1. Mark inventory items as sold
  if (itemIds.length > 0) {
    await supabase
      .from('inventory')
      .update({ sold: true })
      .in('id', itemIds);
      .eq('sold', false);
  }

  // 2. Save order
  await supabase.from('orders').insert({
    stripe_session: session.id,
    total: session.amount_total / 100,
    items: itemIds
  });
}

  return { statusCode: 200, body: 'OK' };
};