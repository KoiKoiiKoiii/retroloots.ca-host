const { getServiceClient } = require("./_supabase");
const { requireAdmin } = require("./_auth");

exports.handler = async (event) => {
  const authError = requireAdmin(event);
  if (authError) return authError;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { statusCode: 500, body: error.message };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
