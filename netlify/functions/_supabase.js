const { createClient } = require("@supabase/supabase-js");

function createSupabaseClient(key) {
  if (!process.env.SUPABASE_URL || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(process.env.SUPABASE_URL, key);
}

const anonClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);

function getServiceClient() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return createSupabaseClient(serviceKey);
}

module.exports = {
  anonClient,
  getServiceClient,
};
