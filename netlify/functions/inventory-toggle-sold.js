const { getServiceClient } = require("./_supabase");
const { requireAdmin } = require("./_auth");

exports.handler = async (event) => {
  const authError = requireAdmin(event);
  if (authError) return authError;

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    let id;

    try {
      const body = event.body ? JSON.parse(event.body) : {};
      id = body.id;
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing id" }),
      };
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("inventory")
      .select("sold")
      .eq("id", id)
      .single();

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    const { error: updateError } = await supabase
      .from("inventory")
      .update({ sold: !data.sold })
      .eq("id", id);

    if (updateError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: updateError.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
