import { randomBytes } from "node:crypto";

// 18 random bytes → 24 URL-safe characters (144 bits), impossible to guess or enumerate.
export function generateAccessToken() {
  return randomBytes(18).toString("base64url");
}

export const ACCESS_TOKEN_PATTERN = /^[A-Za-z0-9_-]{24}$/;
