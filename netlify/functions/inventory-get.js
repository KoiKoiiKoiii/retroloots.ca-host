const { anonClient, getServiceClient } = require("./_supabase");
const { verifyAdminToken } = require("./_auth");

exports.handler = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const isAdmin = verifyAdminToken(token);
  const supabase = isAdmin ? getServiceClient() : anonClient;
  const columns = isAdmin
    ? "*"
    : "id,title,price,images,description_en,description_fr,date,category,created_at";

  let query = supabase
    .from("inventory")
    .select(columns)
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    query = query.eq("sold", false);
  }

  const { data, error } = await query;

  if (error) {
    return { statusCode: 500, body: error.message };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
