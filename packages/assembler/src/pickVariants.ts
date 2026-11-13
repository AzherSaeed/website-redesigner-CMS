import type { AssetMap, SiteContent } from "@wr/schema";

export type VariantPick = {
  hero: "HeroA" | "HeroB" | "HeroC";
  services: "ServicesA" | "ServicesB" | null;
  testimonials: boolean;
  cta: boolean;
};

export function pickVariants(content: SiteContent, assets: AssetMap): VariantPick {
  const heroImage = assets.heroImage;
  const hero: VariantPick["hero"] = heroImage
    ? content.hero.subheadline && content.hero.subheadline.length > 80
      ? "HeroA"
      : "HeroC"
    : "HeroB";

  const services: VariantPick["services"] =
    content.services.length === 0
      ? null
      : assets.serviceImages.length >= content.services.length
        ? "ServicesA"
        : "ServicesB";

  return {
    hero,
    services,
    testimonials: content.testimonials.length > 0,
    cta: true,
  };
}
