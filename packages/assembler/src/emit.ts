import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AssetMap, SiteContent } from "@wr/schema";
import { pickVariants, type VariantPick } from "./pickVariants.js";

export type ProjectFiles = Record<string, string>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENT_DIR = path.resolve(__dirname, "../../components/src");

async function readComponentSources(): Promise<ProjectFiles> {
  const files: ProjectFiles = {};
  async function walk(dir: string) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith(".tsx")) {
        const rel = path.relative(COMPONENT_DIR, full);
        files[`components/${rel}`] = await fs.readFile(full, "utf8");
      }
    }
  }
  await walk(COMPONENT_DIR);
  return files;
}

function pageSource(content: SiteContent, assets: AssetMap, pick: VariantPick): string {
  const imports = [
    `import Hero from "@/components/heroes/${pick.hero}";`,
    pick.services && `import Services from "@/components/services/${pick.services}";`,
    pick.testimonials && `import Testimonials from "@/components/Testimonials";`,
    pick.cta && `import CtaBand from "@/components/CtaBand";`,
    `import Footer from "@/components/Footer";`,
  ]
    .filter(Boolean)
    .join("\n");

  const data = JSON.stringify({ content, assets }, null, 2);

  const eyebrow = content.seo?.title ?? "";
  return `${imports}

const site = ${data} as const;

export default function Page() {
  return (
    <main>
      <Hero
        headline={site.content.hero.headline}
        subheadline={site.content.hero.subheadline}
        ctaText={site.content.hero.ctaText}
        image={site.assets.heroImage}
        eyebrow=${JSON.stringify(eyebrow)}
      />
      ${
        pick.services
          ? `<Services services={site.content.services} images={site.assets.serviceImages} />`
          : ""
      }
      ${pick.testimonials ? `<Testimonials testimonials={site.content.testimonials} />` : ""}
      ${
        pick.cta
          ? `<CtaBand headline={site.content.hero.headline} subheadline={site.content.hero.subheadline} ctaText={site.content.hero.ctaText} email={site.content.contact?.email} />`
          : ""
      }
      <Footer logo={site.assets.logo} contact={site.content.contact} name=${JSON.stringify(eyebrow)} tagline={site.content.about?.text?.slice(0, 140)} />
    </main>
  );
}
`;
}

// Whitelist of Google Fonts we know how to import. Anything else falls back to
// the system stack (still names the requested face first for local install).
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
  "General Sans",
]);

function pickHeadingFont(raw: string): { name: string; import: boolean } {
  const first = raw.split(",")[0]?.replace(/["']/g, "").trim();
  if (first && GOOGLE_FONTS.has(first)) return { name: first, import: true };
  // Default modern display face when the source site's font isn't a safe web font.
  return { name: "Instrument Serif", import: true };
}

function pickBodyFont(raw: string): { name: string; import: boolean } {
  const first = raw.split(",")[0]?.replace(/["']/g, "").trim();
  if (first && GOOGLE_FONTS.has(first)) return { name: first, import: true };
  return { name: "Inter", import: true };
}

function googleFontsHref(fonts: string[]): string {
  const families = fonts
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function layoutSource(content: SiteContent): string {
  const title = content.seo?.title ?? content.hero.headline;
  const description = content.seo?.description ?? content.hero.subheadline ?? "";
  const heading = pickHeadingFont(content.brand.fontHeading);
  const body = pickBodyFont(content.brand.fontBody);
  const fonts = Array.from(new Set([heading, body].filter((f) => f.import).map((f) => f.name)));
  const href = googleFontsHref(fonts);
  return `import "./globals.css";

export const metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href=${JSON.stringify(href)} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
`;
}

function globalsCss(content: SiteContent): string {
  const heading = pickHeadingFont(content.brand.fontHeading).name;
  const body = pickBodyFont(content.brand.fontBody).name;
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --brand-primary: ${content.brand.primaryColor};
  --brand-secondary: ${content.brand.secondaryColor};
  --font-heading: ${JSON.stringify(heading)};
  --font-body: ${JSON.stringify(body)};
}

html { scroll-behavior: smooth; }
html, body { font-family: var(--font-body), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color: #0a0a0a; }
.font-heading { font-family: var(--font-heading), var(--font-body), ui-serif, Georgia, serif; }

::selection { background: var(--brand-primary); color: white; }
`;
}

const TAILWIND_CONFIG = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
`;

const POSTCSS = `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`;

const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: "ES2022",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: false,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  },
  null,
  2,
);

const PACKAGE_JSON = JSON.stringify(
  {
    name: "generated-landing",
    version: "0.1.0",
    private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    dependencies: {
      next: "14.2.5",
      react: "18.3.1",
      "react-dom": "18.3.1",
    },
    devDependencies: {
      typescript: "5.5.4",
      "@types/react": "18.3.3",
      "@types/node": "20.14.10",
      tailwindcss: "3.4.7",
      postcss: "8.4.40",
      autoprefixer: "10.4.19",
    },
  },
  null,
  2,
);

const NEXT_ENV = `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n`;
const NEXT_CONFIG = `/** @type {import('next').NextConfig} */\nmodule.exports = { reactStrictMode: true, images: { unoptimized: true } };\n`;

export async function emit(content: SiteContent, assets: AssetMap): Promise<ProjectFiles> {
  const pick = pickVariants(content, assets);
  const componentFiles = await readComponentSources();

  return {
    "package.json": PACKAGE_JSON,
    "tsconfig.json": TSCONFIG,
    "next.config.js": NEXT_CONFIG,
    "next-env.d.ts": NEXT_ENV,
    "tailwind.config.js": TAILWIND_CONFIG,
    "postcss.config.js": POSTCSS,
    "app/layout.tsx": layoutSource(content),
    "app/page.tsx": pageSource(content, assets, pick),
    "app/globals.css": globalsCss(content),
    ...componentFiles,
  };
}
