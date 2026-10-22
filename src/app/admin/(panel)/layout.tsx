import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { secondaryButtonClass } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin" };

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/admin" className="font-medium">
            Portfolios <span className="font-serif italic text-muted">admin</span>
          </Link>
          <form action={logout}>
            <button type="submit" className={secondaryButtonClass}>
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </>
  );
}
