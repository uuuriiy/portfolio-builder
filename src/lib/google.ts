import "server-only";
import { Google } from "arctic";

export const OAUTH_STATE_COOKIE = "google_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "google_oauth_verifier";
export const OAUTH_COOKIE_PATH = "/api/auth/google";

// Sign-in attempts per IP (start + callback both count) in a 10 minute window.
export const LOGIN_RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };

export const googleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// The redirect URI must also be listed under "Authorized redirect URIs" in Google Cloud.
export function googleClient(origin: string) {
  return new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${origin}/api/auth/google/callback`,
  );
}
