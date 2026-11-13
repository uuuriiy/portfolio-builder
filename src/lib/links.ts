// Public portfolio URLs: /portfolio/<slug>-<key>, e.g. /portfolio/oleh-sypko-mobile-x7Kq9f2a.
// The slug is decoration the admin can edit; the page is looked up by the key alone, so the
// link stays unguessable and old slugs keep working (proxy.ts redirects them to the current one).
// No Node or server-only imports: used by proxy.ts, server code and scripts.

export const PUBLIC_KEY_LENGTH = 8;
export const PUBLIC_KEY_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const PUBLIC_KEY_PATTERN = /^[A-Za-z0-9]{8}$/;
const SLUG_MAX = 60;

export function portfolioPath({ slug, publicKey }: { slug: string; publicKey: string }) {
  return `/portfolio/${slug ? `${slug}-` : ""}${publicKey}`;
}

// "oleh-sypko-x7Kq9f2a" → { slug: "oleh-sypko", key: "x7Kq9f2a" }; null when there is no valid key.
export function parsePortfolioId(id: string) {
  const match = /^(?:(.*)-)?([A-Za-z0-9]{8})$/.exec(id);
  return match ? { slug: match[1] ?? "", key: match[2] } : null;
}

// Ukrainian (with a few Russian letters) → Latin, so Cyrillic names still give readable links.
const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh", з: "z", и: "y",
  і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s",
  т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "iu",
  я: "ia", ё: "e", ы: "y", э: "e", ъ: "", "'": "", "’": "", "ʼ": "",
};

export function slugify(value: string) {
  const slug = [...value.toLowerCase()]
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length <= SLUG_MAX ? slug : slug.slice(0, SLUG_MAX).replace(/-[^-]*$/, "") || slug.slice(0, SLUG_MAX);
}
