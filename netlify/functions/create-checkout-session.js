const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { items } = JSON.parse(event.body);

  const ids = items.map(i => i.id);

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .in('id', ids)
    .eq('sold', false);

  if (error) {
    return { statusCode: 500, body: error.message };
  }

  const line_items = data.map(item => ({
    price_data: {
      currency: 'cad',
      product_data: { name: item.title },
      unit_amount: Math.round(Number(item.price) * 100)
    },
    quantity: 1
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    success_url: `${process.env.URL}/success.html`,
    cancel_url: `${process.env.URL}/`,
      // 👇 CRITICAL PART
    metadata: {
      itemIds: JSON.stringify(itemIds)
  }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ url: session.url })
  };
};