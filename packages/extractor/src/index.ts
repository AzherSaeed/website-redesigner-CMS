import Anthropic from "@anthropic-ai/sdk";
import { SiteContentSchema, type RawScrape, type SiteContent } from "@wr/schema";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
const client = new Anthropic();

const SYSTEM = `You extract structured landing-page content from a raw website scrape.
Return ONLY a JSON object matching the provided schema. No prose, no code fences.
If a field is not present in the scrape, omit it or use an empty array — never invent content.
Preserve the original brand's voice and any real testimonials, services, contact details verbatim.`;

const SCHEMA_HINT = `{
  "hero": { "headline": string, "subheadline"?: string, "ctaText"?: string },
  "about"?: { "text": string },
  "services": [{ "title": string, "description": string }],
  "mission"?: string,
  "vision"?: string,
  "testimonials": [{ "quote": string, "author": string }],
  "contact"?: { "email"?: string, "phone"?: string, "address"?: string },
  "brand": { "primaryColor": string, "secondaryColor": string, "fontHeading": string, "fontBody": string },
  "seo"?: { "title"?: string, "description"?: string }
}`;

function buildPrompt(raw: RawScrape): string {
  return `URL: ${raw.url}
Title: ${raw.title ?? ""}
Meta description: ${raw.metaDescription ?? ""}
Fonts detected — heading: ${raw.fonts.heading ?? ""}, body: ${raw.fonts.body ?? ""}
Colors detected: ${raw.colors.join(", ")}

Sections (role: text):
${raw.sections.map((s) => `[${s.role}] ${s.text}`).join("\n\n")}

Return JSON matching this schema:
${SCHEMA_HINT}`;
}

async function callOnce(raw: RawScrape): Promise<string> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{ role: "user", content: buildPrompt(raw) }],
  });
  const block = msg.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text.trim() : "";
}

function tryParse(text: string): SiteContent | null {
  const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, "");
  try {
    const parsed = JSON.parse(cleaned);
    return SiteContentSchema.parse(parsed);
  } catch {
    return null;
  }
}

export async function structure(raw: RawScrape): Promise<SiteContent> {
  let text = await callOnce(raw);
  let result = tryParse(text);
  if (!result) {
    text = await callOnce(raw);
    result = tryParse(text);
  }
  if (result) return result;

  // Best-effort partial fill — never block the pipeline
  return SiteContentSchema.parse({
    hero: {
      headline: raw.title ?? "Welcome",
      subheadline: raw.metaDescription ?? "",
      ctaText: "Get in touch",
    },
    services: [],
    testimonials: [],
    brand: {},
  });
}
