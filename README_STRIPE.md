Stripe Checkout demo setup

Steps to run and deploy the demo:

1. Install dependencies (needed for Netlify functions):

```bash
npm install
```

2. Locally test Netlify functions (optional):

```bash
npm install -g netlify-cli
netlify dev
```

3. On Netlify, set an environment variable `STRIPE_SECRET_KEY` with your Stripe secret key.

4. Deploy the site to Netlify. The function `/.netlify/functions/create-checkout-session` will use `STRIPE_SECRET_KEY` to create Stripe Checkout sessions.

5. Create a `success.html` page (or edit the `success_url` in the function) to show order confirmation after payment.

Security notes:
- Never expose `STRIPE_SECRET_KEY` in client-side code. Keep it in Netlify environment variables.
- Use Stripe test keys while developing.
