import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/admin/actions";
import { secondaryButtonClass } from "@/components/admin/ui";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin" };

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-6">
          <Link href="/admin" className="font-medium">
            Portfolios <span className="font-serif italic text-muted">admin</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Suspense>
              <SignedInAs />
            </Suspense>
            <Link href="/admin/security" className="text-muted transition hover:text-foreground">
              Security
            </Link>
            <form action={logout}>
              <button type="submit" className={secondaryButtonClass}>
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </>
  );
}

async function SignedInAs() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  return <span className="hidden truncate text-muted sm:inline">{admin.email}</span>;
}
