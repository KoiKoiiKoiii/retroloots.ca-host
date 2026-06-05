const { createAdminToken } = require("./_auth");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let credentials;
  try {
    credentials = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "Invalid JSON" }),
    };
  }

  const { username, password } = credentials;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (username === adminUsername && password === adminPassword) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        token: createAdminToken(username),
      }),
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ success: false, message: "Invalid login" }),
  };
};
