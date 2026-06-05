export async function handler(event) {
  const { username, password } = JSON.parse(event.body);

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // simple session token (for basic admin use)
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, token }),
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ success: false, message: "Invalid login" }),
  };
}