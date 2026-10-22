import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin" };

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <LoginForm />
    </main>
  );
}
