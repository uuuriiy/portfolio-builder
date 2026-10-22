export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">
        This page <em className="font-serif italic">doesn&apos;t exist</em>
      </h1>
      <p className="mt-4 max-w-sm text-muted">The link may be mistyped or no longer active.</p>
    </main>
  );
}
