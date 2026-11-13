import { renderToStaticMarkup } from "react-dom/server";
import {
  HeroA,
  HeroB,
  HeroC,
  ServicesA,
  ServicesB,
  Testimonials,
  CtaBand,
  Footer,
} from "@wr/components";
import { pickVariants } from "@wr/assembler";
import type { AssetMap, SiteContent } from "@wr/schema";

const HEROES = { HeroA, HeroB, HeroC } as const;
const SERVICES = { ServicesA, ServicesB } as const;

const GOOGLE_FONTS = new Set([
  "Inter",
  "Manrope",
  "Space Grotesk",
  "DM Sans",
  "Plus Jakarta Sans",
  "Poppins",
  "Sora",
  "Instrument Serif",
  "Fraunces",
  "Playfair Display",
]);
const pickFont = (raw: string, fallback: string) => {
  const first = raw.split(",")[0]?.replace(/["']/g, "").trim();
  return first && GOOGLE_FONTS.has(first) ? first : fallback;
};

export function renderPreviewHtml(content: SiteContent, assets: AssetMap): string {
  const pick = pickVariants(content, assets);
  const Hero = HEROES[pick.hero];
  const Services = pick.services ? SERVICES[pick.services] : null;
  const eyebrow = content.seo?.title ?? "";
  const heading = pickFont(content.brand.fontHeading, "Instrument Serif");
  const body = pickFont(content.brand.fontBody, "Inter");

  const tree = (
    <main>
      <Hero
        headline={content.hero.headline}
        subheadline={content.hero.subheadline}
        ctaText={content.hero.ctaText}
        image={assets.heroImage}
        eyebrow={eyebrow}
      />
      {Services && pick.services && (
        <Services services={content.services} images={assets.serviceImages} />
      )}
      {pick.testimonials && <Testimonials testimonials={content.testimonials} />}
      {pick.cta && (
        <CtaBand
          headline={content.hero.headline}
          subheadline={content.hero.subheadline}
          ctaText={content.hero.ctaText}
          email={content.contact?.email}
        />
      )}
      <Footer
        logo={assets.logo}
        contact={content.contact}
        name={eyebrow}
        tagline={content.about?.text?.slice(0, 140)}
      />
    </main>
  );

  const bodyHtml = renderToStaticMarkup(tree);
  const fontHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(heading)}:wght@400;500;600;700&family=${encodeURIComponent(body)}:wght@400;500;600;700&display=swap`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(content.seo?.title ?? content.hero.headline)}</title>
<meta name="description" content="${escapeHtml(content.seo?.description ?? content.hero.subheadline ?? "")}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="${fontHref}" />
<script src="https://cdn.tailwindcss.com"></script>
<style>
  :root {
    --brand-primary: ${content.brand.primaryColor};
    --brand-secondary: ${content.brand.secondaryColor};
    --font-heading: "${heading}";
    --font-body: "${body}";
  }
  html { scroll-behavior: smooth; }
  html, body { font-family: var(--font-body), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color: #0a0a0a; margin: 0; }
  .font-heading { font-family: var(--font-heading), var(--font-body), ui-serif, Georgia, serif; }
  ::selection { background: var(--brand-primary); color: white; }
</style>
</head>
<body class="antialiased">${bodyHtml}</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : c === '"'
            ? "&quot;"
            : "&#39;",
  );
}
