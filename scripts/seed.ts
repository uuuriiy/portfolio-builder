// Creates the first developer from the content of the original sypko-portfolio.vercel.app page.
// Safe to re-run: skips if a developer with the same name already exists.
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { developers, projects } from "../src/db/schema";
import { generateAccessToken } from "../src/lib/tokens";

type SeedProject = {
  title: string;
  description: string;
  year: string;
  link: string;
  image: string;
  gallery: string[];
  tags: string[];
  createdAt: string;
};

const NAME = "Oleh Sypko";

async function main() {
  const [existing] = await db.select().from(developers).where(eq(developers.name, NAME));
  if (existing) {
    console.log(`${NAME} already exists: /p/${existing.accessToken}`);
    process.exit(0);
  }

  const [developer] = await db
    .insert(developers)
    .values({
      accessToken: generateAccessToken(),
      isPublished: true,
      internalLabel: "Original portfolio",
      name: NAME,
      role: "UX/UI Designer",
      heroTitleBefore: "Designing",
      heroTitleAccent: "thoughtful",
      heroTitleAfter: "digital experiences",
      heroSubtitle: "I'm Oleh, a UX/UI designer crafting interfaces where aesthetics meet function",
      bio: [
        "I design digital products end to end: from research and user flows to polished UI and scalable design systems. My work sits between user needs, business goals and visual clarity.",
        "I care about typography, rhythm and the small interactions that make a product feel alive. Every screen has a purpose, every interaction has a reason, and every detail should make the experience easier to understand.",
      ],
      facts: [
        { label: "Location", value: "Lviv, Ukraine" },
        { label: "Experience", value: "6 years" },
        { label: "Focus", value: "Product design" },
        { label: "Specialization", value: "Web & Mobile" },
        { label: "Availability", value: "Open to work" },
      ],
      skills: ["UI Design", "UX Research", "Design Systems", "Prototyping", "Web Design", "Mobile Apps"],
      email: "sypko.work@gmail.com",
      contactTitle: "Have a project",
      contactTitleAccent: "in your mind?",
      contactSubtitle: "Tell me about it and I will get back to you within a day",
      contactCta: "Contact with me",
    })
    .returning();

  const items: SeedProject[] = JSON.parse(readFileSync(new URL("./seed-projects.json", import.meta.url), "utf8"));
  await db.insert(projects).values(
    items.map((p, i) => ({
      developerId: developer.id,
      title: p.title,
      description: p.description.replace(/\r\n/g, "\n"),
      year: p.year,
      link: p.link,
      image: p.image,
      gallery: p.gallery,
      tags: p.tags,
      featured: i === 0,
      sortOrder: i,
      createdAt: new Date(p.createdAt),
    })),
  );

  console.log(`Created ${NAME} with ${items.length} projects: /p/${developer.accessToken}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
