const { createClient } = require("@supabase/supabase-js");

function createSupabaseClient(key) {
  if (!process.env.SUPABASE_URL || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(process.env.SUPABASE_URL, key);
}

const anonClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);

function getServiceClient() {
  return createSupabaseClient(process.env.SUPABASE_SERVICE_KEY);
}

module.exports = {
  anonClient,
  getServiceClient,
};
