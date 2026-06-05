const crypto = require("crypto");

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
}

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function sign(value) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET or ADMIN_PASSWORD");
  }

  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createAdminToken(username) {
  const payload = {
    sub: username,
    iat: Date.now(),
  };
  const encodedPayload = base64UrlEncode(payload);
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyAdminToken(token) {
  try {
    if (!token || !token.includes(".")) return false;

    const [encodedPayload, signature] = token.split(".");
    const expected = sign(encodedPayload);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return false;
    }

    const payload = base64UrlDecode(encodedPayload);
    return Boolean(payload.sub && Date.now() - payload.iat <= SESSION_TTL_MS);
  } catch {
    return false;
  }
}

function getBearerToken(event) {
  const header =
    event.headers.authorization ||
    event.headers.Authorization ||
    "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function requireAdmin(event) {
  if (verifyAdminToken(getBearerToken(event))) {
    return null;
  }

  return {
    statusCode: 401,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Unauthorized" }),
  };
}

module.exports = {
  createAdminToken,
  requireAdmin,
  verifyAdminToken,
};
