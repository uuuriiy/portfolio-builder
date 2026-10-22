import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { getPublicPortfolio } from "@/lib/data";

// Always rendered per request (connection()) so hiding a page or issuing a new link
// takes effect immediately. proxy.ts turns unknown tokens into a real 404 first.
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/p/[token]">): Promise<Metadata> {
  await connection();
  const { token } = await params;
  const portfolio = await getPublicPortfolio(token);
  if (!portfolio) return { title: "Not found" };

  const { profile, projects } = portfolio;
  const title = profile.role ? `${profile.name} - ${profile.role}` : profile.name;
  const description = profile.heroSubtitle || undefined;
  const cover = projects.find((p) => p.image)?.image;

  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: { title, description, type: "profile", images: cover ? [cover] : undefined },
    twitter: { card: cover ? "summary_large_image" : "summary", title, description },
  };
}

export default async function PortfolioPage({ params }: PageProps<"/p/[token]">) {
  await connection();
  const { token } = await params;
  const portfolio = await getPublicPortfolio(token);
  if (!portfolio) notFound();

  return <Portfolio portfolio={portfolio} />;
}
