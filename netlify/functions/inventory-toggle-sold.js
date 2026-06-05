const supabase = require("./_supabase");

exports.handler = async (event) => {
  console.log("EVENT BODY RAW:", event.body);
  console.log("EVENT HEADERS:", event.headers);
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