const supabase = require("./_supabase");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { id, current } = JSON.parse(event.body);

  const { error } = await supabase
    .from("inventory")
    .update({ sold: !current })
    .eq("id", id);

  if (error) {
    return { statusCode: 500, body: error.message };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};