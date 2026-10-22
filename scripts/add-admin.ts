import { adminEmailSchema } from "../src/lib/forms";
import { db } from "../src/db";
import { admins } from "../src/db/schema";

// Bootstraps access: nobody can sign in until at least one Google email is on the list.
// Usage: npm run admin:add -- you@gmail.com
async function main() {
  const parsed = adminEmailSchema.safeParse(process.argv[2]);
  if (!parsed.success) {
    console.error("Usage: npm run admin:add -- you@gmail.com");
    process.exit(1);
  }

  const inserted = await db.insert(admins).values({ email: parsed.data }).onConflictDoNothing().returning();
  console.log(inserted.length ? `Added ${parsed.data}` : `${parsed.data} already has access`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
