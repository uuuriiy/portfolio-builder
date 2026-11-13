import { randomBytes } from "node:crypto";
import { PUBLIC_KEY_ALPHABET, PUBLIC_KEY_LENGTH } from "./links";

// 18 random bytes → 24 URL-safe characters (144 bits). Only used by legacy /p/<token> links,
// which proxy.ts redirects to the current /portfolio/… URL.
export function generateAccessToken() {
  return randomBytes(18).toString("base64url");
}

export const ACCESS_TOKEN_PATTERN = /^[A-Za-z0-9_-]{24}$/;

// Random part of the public link: 8 characters from 62 (~47.6 bits). Rejection sampling keeps
// every character equally likely (248 = 4 × 62).
export function generatePublicKey() {
  let key = "";
  while (key.length < PUBLIC_KEY_LENGTH) {
    for (const byte of randomBytes(16)) {
      if (byte < 248 && key.length < PUBLIC_KEY_LENGTH) key += PUBLIC_KEY_ALPHABET[byte % 62];
    }
  }
  return key;
}
