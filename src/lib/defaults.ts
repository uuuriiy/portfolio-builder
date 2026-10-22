import type { Developer, Project } from "@/db/schema";

export type DeveloperValues = Omit<Developer, "id" | "accessToken" | "isPublished" | "createdAt" | "updatedAt">;
export type ProjectValues = Pick<
  Project,
  "title" | "description" | "year" | "link" | "image" | "gallery" | "tags" | "featured"
>;

// Starting values for a new developer, matching the copy of the original portfolio.
export const emptyDeveloper: DeveloperValues = {
  internalLabel: "",
  name: "",
  role: "",
  heroBadge: "",
  heroTitleBefore: "",
  heroTitleAccent: "",
  heroTitleAfter: "",
  heroSubtitle: "",
  bio: [],
  facts: [
    { label: "Location", value: "" },
    { label: "Experience", value: "" },
    { label: "Focus", value: "" },
    { label: "Specialization", value: "" },
    { label: "Availability", value: "Open to work" },
  ],
  skills: [],
  email: "",
  contactTitle: "Have a project",
  contactTitleAccent: "in your mind?",
  contactSubtitle: "Tell me about it and I will get back to you within a day",
  contactCta: "Contact with me",
  contactLinks: [],
};

export const emptyProject: ProjectValues = {
  title: "",
  description: "",
  year: "",
  link: "",
  image: "",
  gallery: [],
  tags: [],
  featured: false,
};
