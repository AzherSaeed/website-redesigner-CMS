import { chromium } from "playwright";
import * as cheerio from "cheerio";
import type { RawScrape } from "@wr/schema";

const ICON_PATTERN =
  /whatsapp|instagram|facebook|twitter|linkedin|youtube|tiktok|snapchat|pinterest|telegram|x-social|social|flag|icon|sprite|favicon|emoji/i;
const MIN_CONTENT_AREA = 200 * 200;
const MIN_CONTENT_DIMENSION = 180;

export async function scrape(url: string): Promise<RawScrape> {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    // @ts-expect-error injected shim for tsx/esbuild __name helper
    globalThis.__name = globalThis.__name ?? ((fn: unknown) => fn);
  });
  await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });

  const html = await page.content();
  const title = await page.title();

  // Collect fully-rendered image data with context and real dimensions.
  const rawImages = await page.evaluate(() => {
    const rects = (el: Element) => el.getBoundingClientRect();
    const inRole = (el: Element, roles: string[]) =>
      roles.some((r) => el.closest(r));
    return Array.from(document.querySelectorAll("img")).map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt || "",
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      renderedWidth: rects(img).width,
      renderedHeight: rects(img).height,
      inHeader: inRole(img, ["header", "nav"]),
      inFooter: inRole(img, ["footer"]),
      inMain: inRole(img, ["main", "section", "article"]),
      className: img.className || "",
      id: img.id || "",
    }));
  });

  const computed = await page.evaluate(() => {
    const pickBg = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).backgroundColor : "";
    };
    const cta =
      document.querySelector('a[class*="btn"],button,a[href*="contact"]') ||
      document.querySelector("a,button");
    return {
      headerBg: pickBg("header"),
      bodyColor: getComputedStyle(document.body).color,
      ctaBg: cta ? getComputedStyle(cta as Element).backgroundColor : "",
      fontHeading: (() => {
        const h = document.querySelector("h1,h2");
        return h ? getComputedStyle(h).fontFamily : "";
      })(),
      fontBody: getComputedStyle(document.body).fontFamily,
    };
  });

  await browser.close();

  const $ = cheerio.load(html);
  const metaDescription = $('meta[name="description"]').attr("content") || undefined;

  const sections: RawScrape["sections"] = [];
  const roles = ["header", "main", "section", "article", "aside", "footer"];
  roles.forEach((tag) => {
    $(tag).each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text.length > 40) sections.push({ role: tag, text: text.slice(0, 4000) });
    });
  });

  const looksLikeIcon = (i: (typeof rawImages)[number]) => {
    if (ICON_PATTERN.test(i.src)) return true;
    if (ICON_PATTERN.test(i.alt)) return true;
    if (ICON_PATTERN.test(i.className) || ICON_PATTERN.test(i.id)) return true;
    if (i.src.endsWith(".svg")) return true;
    return false;
  };

  const abs = (src: string) => {
    try {
      return new URL(src, url).toString();
    } catch {
      return src;
    }
  };

  // Score: prefer in-main, larger area, landscape-ish, non-icon.
  type ScoredImg = {
    src: string;
    alt?: string;
    width: number;
    height: number;
    area: number;
    score: number;
  };

  const scored: ScoredImg[] = rawImages
    .filter((i) => i.src && !looksLikeIcon(i))
    .map((i) => {
      const width = i.naturalWidth || i.renderedWidth;
      const height = i.naturalHeight || i.renderedHeight;
      const area = width * height;
      let score = 0;
      if (i.inMain) score += 100;
      if (i.inHeader) score -= 40;
      if (i.inFooter) score -= 30;
      score += Math.min(area / 10_000, 60);
      const ratio = width && height ? width / height : 1;
      if (ratio > 1.2 && ratio < 2.5) score += 15;
      return {
        src: abs(i.src),
        alt: i.alt || undefined,
        width,
        height,
        area,
        score,
      };
    })
    .filter(
      (i) =>
        i.area >= MIN_CONTENT_AREA &&
        i.width >= MIN_CONTENT_DIMENSION &&
        i.height >= MIN_CONTENT_DIMENSION,
    )
    .sort((a, b) => b.score - a.score);

  // Dedupe by src.
  const seen = new Set<string>();
  const images = scored
    .filter((i) => (seen.has(i.src) ? false : (seen.add(i.src), true)))
    .map(({ src, alt, width, height }) => ({ src, alt, width, height }));

  // Logo detection — restricted to header/nav, allowing small dimensions and SVG.
  const logoCandidates: string[] = [];
  $("header, nav")
    .find('img[alt*="logo" i],img[class*="logo" i],img[id*="logo" i]')
    .each((_, el) => {
      const src = $(el).attr("src");
      if (src) logoCandidates.push(abs(src));
    });
  if (logoCandidates.length === 0) {
    const headerImg = $("header img, nav img").first().attr("src");
    if (headerImg) logoCandidates.push(abs(headerImg));
  }
  const icon = $('link[rel*="icon"]').attr("href");
  if (icon) logoCandidates.push(abs(icon));

  // Never let a logo candidate double as a content image.
  const logoSet = new Set(logoCandidates);
  const contentImages = images.filter((i) => !logoSet.has(i.src));

  const colors = [computed.headerBg, computed.ctaBg, computed.bodyColor]
    .filter(Boolean)
    .filter((c) => !/rgba?\(0,\s*0,\s*0,\s*0\)/.test(c));

  return {
    url,
    title,
    metaDescription,
    sections,
    images: contentImages,
    logoCandidates,
    colors,
    fonts: { heading: computed.fontHeading, body: computed.fontBody },
  };
}
