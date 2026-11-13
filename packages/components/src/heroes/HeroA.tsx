type Props = {
  headline: string;
  subheadline?: string;
  ctaText?: string;
  image?: string;
  eyebrow?: string;
};

export default function HeroA({ headline, subheadline, ctaText, image, eyebrow }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--brand-primary)" }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-28 md:grid-cols-[1.1fr_1fr] md:py-36">
        <div>
          {eyebrow && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-neutral-600 backdrop-blur">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--brand-primary)" }}
              />
              {eyebrow}
            </div>
          )}
          <h1 className="font-heading text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.02em] text-neutral-900 md:text-6xl lg:text-7xl">
            {headline}
          </h1>
          {subheadline && (
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-600 md:text-xl">
              {subheadline}
            </p>
          )}
          {ctaText && (
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-medium text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: "var(--brand-primary)" }}
              >
                {ctaText}
                <span className="transition group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#services"
                className="inline-flex items-center rounded-full border border-neutral-200 px-7 py-4 text-sm font-medium text-neutral-800 transition hover:border-neutral-400"
              >
                Learn more
              </a>
            </div>
          )}
        </div>
        {image && (
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[2rem] opacity-20 blur-2xl"
              style={{ background: "var(--brand-primary)" }}
            />
            <img
              src={image}
              alt=""
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl shadow-black/20"
            />
          </div>
        )}
      </div>
    </section>
  );
}
