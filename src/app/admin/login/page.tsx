import type { Metadata } from "next";
import { Suspense } from "react";
import { buttonClass } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Admin" };

const errors: Record<string, string> = {
  not_allowed: "This Google account doesn't have access. Ask an admin to add your email.",
  rate_limited: "Too many sign-in attempts. Try again in a few minutes.",
  expired: "The sign-in took too long or was started in another tab. Please try again.",
  cancelled: "Sign-in was cancelled.",
  not_configured: "Google sign-in isn't configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  failed: "Google sign-in failed. Please try again.",
};

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-8">
        <h1 className="text-2xl font-medium tracking-tight">Admin</h1>
        <p className="mt-2 text-sm text-muted">Sign in with an approved Google account to manage portfolios.</p>
        <Suspense>
          <LoginError searchParams={searchParams} />
        </Suspense>
        {/* A plain link, not <Link>: this must be a full navigation to Google, never a prefetch. */}
        <a href="/api/auth/google" className={`${buttonClass} mt-6 flex w-full items-center justify-center gap-2 py-2.5`}>
          <GoogleIcon />
          Sign in with Google
        </a>
      </div>
    </main>
  );
}

async function LoginError({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? errors[error] : undefined;
  if (!message) return null;
  return (
    <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {message}
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
    </svg>
  );
}
