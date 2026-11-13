import { z } from "zod";

export const BrandSchema = z.object({
  primaryColor: z.string().default("#111827"),
  secondaryColor: z.string().default("#2563eb"),
  fontHeading: z.string().default("Inter"),
  fontBody: z.string().default("Inter"),
});

export const SiteContentSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subheadline: z.string().optional().default(""),
    ctaText: z.string().optional().default("Get in touch"),
  }),
  about: z.object({ text: z.string() }).optional(),
  services: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .default([]),
  mission: z.string().optional(),
  vision: z.string().optional(),
  testimonials: z
    .array(z.object({ quote: z.string(), author: z.string() }))
    .default([]),
  contact: z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  brand: BrandSchema,
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;
export type Brand = z.infer<typeof BrandSchema>;

export interface RawScrape {
  url: string;
  title?: string;
  metaDescription?: string;
  sections: { role: string; text: string }[];
  images: { src: string; alt?: string; width?: number; height?: number }[];
  logoCandidates: string[];
  colors: string[];
  fonts: { heading?: string; body?: string };
}

export interface AssetMap {
  logo?: string;
  heroImage?: string;
  aboutImage?: string;
  serviceImages: string[];
}
