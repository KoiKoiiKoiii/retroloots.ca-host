const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const filesToCheck = [
  "js/cart.js",
  "js/dark-mode.js",
  "js/shop.js",
  "js/site.js",
  "netlify/functions/_auth.js",
  "netlify/functions/_supabase.js",
  "netlify/functions/create-checkout-session.js",
  "netlify/functions/inventory-get.js",
  "netlify/functions/inventory-toggle-sold.js",
  "netlify/functions/login.js",
  "netlify/functions/orders-get.js",
  "netlify/functions/send-contact-email.js",
  "netlify/functions/stripe-webhook.js",
];

for (const file of filesToCheck) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
}

process.env.ADMIN_PASSWORD = "test-secret";
const { createAdminToken, verifyAdminToken } = require("../netlify/functions/_auth");

if (!verifyAdminToken(createAdminToken("admin"))) {
  throw new Error("Admin token verification failed");
}

const shopJs = fs.readFileSync(path.join(root, "js/shop.js"), "utf8");
if (shopJs.includes("orders-get") || shopJs.includes("results.flat()")) {
  throw new Error("Shop script still contains the old public orders/flat bug");
}

console.log("Smoke tests passed");
