exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable' }) };
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return { statusCode: 400, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ error: 'No items provided' }) };

  try {
    const currency = 'cad';
    const line_items = items.map(i => ({
      price_data: {
        currency,
        product_data: { name: i.name },
        unit_amount: Math.round(Number(i.price) * 100),
      },
      quantity: Number(i.quantity || 1),
    }));

    const origin = process.env.URL || process.env.SITE_URL || 'http://localhost:8888';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/success.html`,
      cancel_url: `${origin}/`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err && err.message ? err.message : err);
    return { statusCode: 500, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ error: 'Server error', details: err && err.message ? err.message : String(err) }) };
  }
};
