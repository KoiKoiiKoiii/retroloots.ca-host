const { anonClient, getServiceClient } = require("./_supabase");

exports.handler = async () => {
  const { data, error } = await anonClient
    .from("inventory")
    .select("subcategory, category")
    .eq("sold", false)
    .eq("category", "video-games");

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }

  const consoles = new Set();

  for (const item of data || []) {
    if (item.subcategory) {
      consoles.add(item.subcategory);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      consoles: [...consoles].sort()
    })
  };
};