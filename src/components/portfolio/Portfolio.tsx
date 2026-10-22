import type { PublicPortfolio } from "@/lib/data";
import { ProjectCard, type ProjectView } from "./ProjectCard";
import { Reveal } from "./Reveal";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function Accented({ before, accent, after }: { before: string; accent: string; after?: string }) {
  return (
    <>
      {before}
      {accent && (
        <>
          {" "}
          <em className="font-serif italic">{accent}</em>
        </>
      )}
      {after && <> {after}</>}
    </>
  );
}

export function Portfolio({ portfolio }: { portfolio: PublicPortfolio }) {
  const { profile, projects } = portfolio;
  const year = profile.updatedAt.getFullYear();

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden">
        <div className="absolute left-1/2 top-[-320px] h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-white/5 blur-[120px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-background/70 backdrop-blur-md">
        <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-end px-6">
          <div className="flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-muted transition hover:text-foreground">
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6">
        <section className="flex min-h-[92svh] flex-col justify-center pb-20 pt-32">
          {profile.heroBadge && (
            <p className="fade-up inline-flex w-fit items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-foreground/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {profile.heroBadge}
            </p>
          )}
          <h1
            className="fade-up mt-8 max-w-3xl text-5xl font-medium tracking-tight sm:text-7xl"
            style={{ animationDelay: "0.1s" }}
          >
            <Accented
              before={profile.heroTitleBefore}
              accent={profile.heroTitleAccent}
              after={profile.heroTitleAfter}
            />
          </h1>
          {profile.heroSubtitle && (
            <p
              className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted"
              style={{ animationDelay: "0.2s" }}
            >
              {profile.heroSubtitle}
            </p>
          )}
          <div className="fade-up mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.3s" }}>
            {projects.length > 0 && (
              <a
                href="#work"
                className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-black transition hover:bg-white/80"
              >
                View work
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="rounded-full border border-line px-6 py-3 text-sm transition hover:border-white/40"
              >
                Get in touch
              </a>
            )}
          </div>
        </section>

        {projects.length > 0 && (
          <section id="work" className="scroll-mt-24 py-24">
            <Reveal>
              <h2 className="mb-10 text-3xl font-medium tracking-tight sm:text-4xl">Previous work</h2>
            </Reveal>
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
              {projects.map((project, i) => {
                const view: ProjectView = {
                  title: project.title,
                  description: project.description,
                  year: project.year,
                  link: project.link,
                  image: project.image,
                  gallery: project.gallery,
                  tags: project.tags,
                };
                return (
                  <Reveal
                    key={project.id}
                    delay={(i % 2) * 0.1}
                    className={project.featured ? "sm:col-span-2" : ""}
                  >
                    <ProjectCard project={view} featured={project.featured} coverFormat={profile.coverFormat} />
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        <section id="about" className="scroll-mt-24 border-t border-line py-24">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">About me</h2>
              {profile.facts.length > 0 && (
                <dl className="mt-8 space-y-4 md:max-w-xs">
                  {profile.facts.map((fact) => (
                    <div key={fact.label} className="flex justify-between border-b border-line pb-3 text-sm">
                      <dt className="text-muted">{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-muted">
                {profile.bio.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              {profile.skills.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-foreground/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </Reveal>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 border-t border-line py-32 text-center">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Contact</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-medium tracking-tight sm:text-6xl">
              <Accented before={profile.contactTitle} accent={profile.contactTitleAccent} />
            </h2>
            {profile.contactSubtitle && (
              <p className="mx-auto mt-6 max-w-md text-lg text-muted">{profile.contactSubtitle}</p>
            )}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-black transition hover:bg-white/80"
                >
                  {profile.contactCta || "Contact with me"}
                </a>
              )}
              {profile.contactLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line px-6 py-3 text-sm transition hover:border-white/40"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted sm:flex-row">
          <p>
            © {profile.name} {year}
          </p>
          <a href="#" className="transition hover:text-foreground">
            Back to top
          </a>
        </div>
      </footer>
    </>
  );
}
