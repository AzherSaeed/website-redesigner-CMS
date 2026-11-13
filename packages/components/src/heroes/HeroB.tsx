type Props = { headline: string; subheadline?: string; ctaText?: string; eyebrow?: string };

export default function HeroB({ headline, subheadline, ctaText, eyebrow }: Props) {
  return (
    <section
      className="relative overflow-hidden py-32 text-center text-white md:py-48"
      style={{
        background:
          "radial-gradient(ellipse at 20% 20%, color-mix(in oklab, var(--brand-primary) 90%, white 10%) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, color-mix(in oklab, var(--brand-secondary) 85%, black 15%) 0%, transparent 60%), #0a0a0a",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-6">
        {eyebrow && (
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur">
            {eyebrow}
          </div>
        )}
        <h1 className="font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-7xl lg:text-[5.5rem]">
          {headline}
        </h1>
        {subheadline && (
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
            {subheadline}
          </p>
        )}
        {ctaText && (
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-medium text-neutral-900 shadow-2xl shadow-black/40 transition hover:-translate-y-0.5"
            >
              {ctaText}
              <span className="transition group-hover:translate-x-1">→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
