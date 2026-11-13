type Props = { testimonials: { quote: string; author: string }[]; sectionTitle?: string };

export default function Testimonials({ testimonials, sectionTitle = "What people say" }: Props) {
  if (!testimonials.length) return null;
  return (
    <section
      className="relative overflow-hidden py-28 text-white md:py-36"
      style={{
        background:
          "linear-gradient(135deg, #0a0a0a 0%, color-mix(in oklab, var(--brand-primary) 30%, #0a0a0a 70%) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-white/50">
            Testimonials
          </div>
          <h2 className="font-heading text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
            {sectionTitle}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <blockquote
              key={i}
              className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div
                aria-hidden
                className="mb-4 font-heading text-5xl leading-none"
                style={{ color: "var(--brand-primary)" }}
              >
                &ldquo;
              </div>
              <p className="text-lg leading-relaxed text-white/90">{t.quote}</p>
              <footer className="mt-6 flex items-center gap-3 text-sm text-white/60">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: "var(--brand-primary)" }}
                >
                  {t.author.trim().charAt(0).toUpperCase()}
                </span>
                {t.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
