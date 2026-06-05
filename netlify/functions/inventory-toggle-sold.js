const { id } = JSON.parse(event.body);

const { data, error } = await supabase
  .from("inventory")
  .select("sold")
  .eq("id", id)
  .single();

if (error) {
  return { statusCode: 500, body: error.message };
}

const { error: updateError } = await supabase
  .from("inventory")
  .update({ sold: !data.sold })
  .eq("id", id);

if (updateError) {
  return { statusCode: 500, body: updateError.message };
}

return {
  statusCode: 200,
  body: JSON.stringify({ success: true })
};