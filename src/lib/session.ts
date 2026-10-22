// Shared by proxy.ts and server code, so it must not import server-only modules.
export const SESSION_COOKIE = "admin_session";

// A session ends after 12 hours without activity, and after 7 days no matter what.
export const SESSION_IDLE_MS = 12 * 60 * 60 * 1000;
export const SESSION_MAX_MS = 7 * 24 * 60 * 60 * 1000;

// Raw tokens are 32 random bytes, base64url (43 chars). Cheap shape check before any DB lookup.
export const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
