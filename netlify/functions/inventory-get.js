const { anonClient, getServiceClient } = require("./_supabase");
const { verifyAdminToken } = require("./_auth");

exports.handler = async (event) => {
  try {
    const authHeader =
      event.headers.authorization || event.headers.Authorization || "";

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const isAdmin = verifyAdminToken(token);
    const supabase = isAdmin ? getServiceClient() : anonClient;

    const columns = isAdmin
      ? "*"
      : "id,title,price,images,description_en,description_fr,date,category,created_at,subcategory";
    const params = event.queryStringParameters || {};
    const sort = params.sort || 'relevance';

    const page = Math.max(parseInt(params.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(params.limit || "12", 10), 1), 100);
    const offset = (page - 1) * limit;

    const search = (params.search || "").trim();
    const category = params.category || null;
    const consoleFilter = params.console || null;
    let query = supabase
      .from("inventory")
      .select(columns, { count: "exact" });
    if (!isAdmin) {
      query = query.eq("sold", false);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (consoleFilter && consoleFilter !== "all") {
      query = query.ilike("subcategory", consoleFilter);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description_en.ilike.%${search}%,description_fr.ilike.%${search}%`
      );
    }
    switch (sort) {
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      case "name":
        query = query.order("title", { ascending: true });
        break;
      case "relevance":
        default:
          query = query.order("created_at", { ascending: false });
          break;
    }
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        products: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 1,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Internal server error",
      }),
    };
  }
};