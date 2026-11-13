type Props = { headline: string; ctaText?: string; email?: string; subheadline?: string };

export default function CtaBand({
  headline,
  ctaText = "Get in touch",
  email,
  subheadline,
}: Props) {
  return (
    <section id="contact" className="relative overflow-hidden py-28 md:py-32">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in oklab, var(--brand-primary) 60%, black 40%) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 text-white md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-heading text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-4 text-lg leading-relaxed text-white/80">{subheadline}</p>
          )}
        </div>
        <a
          href={email ? `mailto:${email}` : "#"}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-medium text-neutral-900 shadow-2xl shadow-black/20 transition hover:-translate-y-0.5"
        >
          {ctaText}
          <span className="transition group-hover:translate-x-1">→</span>
        </a>
      </div>
    </section>
  );
}
