/**
 * Head tags for a public page: title, description, canonical URL and the
 * Open Graph / Twitter tags that WhatsApp, iMessage, Slack and friends read
 * to build a link preview. Every route should go through this so no page
 * falls back to generic defaults when its link is shared.
 */

export const SITE_URL = "https://www.andreashof-breechen.de";
export const SITE_NAME = "Andreashof Breechen";
export const DEFAULT_DESCRIPTION =
  "Gustavianisches Gutshaus aus dem 18. Jahrhundert in Gützkow, Vorpommern. Komplett mietbar für bis zu 21 Gäste — Familien, Hochzeiten, Retreats.";
const DEFAULT_IMAGE = "/og-image.jpg";

interface SeoInput {
  title: string;
  description?: string;
  /** Path of the page, e.g. "/zimmer". Omit for pages without a stable URL. */
  path?: string;
  /** Site-relative or absolute preview image; defaults to the house photo. */
  image?: string;
  /** Value for the robots meta tag, e.g. "noindex". */
  robots?: string;
}

const absolute = (url: string) => (url.startsWith("http") ? url : `${SITE_URL}${url}`);

export function seo({ title, description = DEFAULT_DESCRIPTION, path, image, robots }: SeoInput) {
  const imageUrl = absolute(image ?? DEFAULT_IMAGE);
  const isDefaultImage = !image;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(robots ? [{ name: "robots", content: robots }] : []),
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "de_DE" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      ...(path ? [{ property: "og:url", content: absolute(path) }] : []),
      { property: "og:image", content: imageUrl },
      // Dimensions are only known for the default image.
      ...(isDefaultImage
        ? [
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { property: "og:image:type", content: "image/jpeg" },
          ]
        : []),
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
    links: path ? [{ rel: "canonical", href: absolute(path) }] : [],
  };
}
