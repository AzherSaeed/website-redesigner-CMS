type Props = { headline: string; subheadline?: string; ctaText?: string; image?: string; eyebrow?: string };

export default function HeroC({ headline, subheadline, ctaText, image, eyebrow }: Props) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/85" />
      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-6 pb-24 pt-32 text-white">
        {eyebrow && (
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur">
            {eyebrow}
          </div>
        )}
        <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-7xl lg:text-[5.5rem]">
          {headline}
        </h1>
        {subheadline && (
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
            {subheadline}
          </p>
        )}
        {ctaText && (
          <a
            href="#contact"
            className="group mt-10 inline-flex w-fit items-center gap-2 rounded-full px-8 py-4 text-sm font-medium shadow-xl shadow-black/40 transition hover:-translate-y-0.5"
            style={{ background: "var(--brand-primary)", color: "white" }}
          >
            {ctaText}
            <span className="transition group-hover:translate-x-1">→</span>
          </a>
        )}
      </div>
    </section>
  );
}
