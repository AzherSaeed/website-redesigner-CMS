type Props = {
  services: { title: string; description: string }[];
  sectionTitle?: string;
  sectionKicker?: string;
};

export default function ServicesB({
  services,
  sectionTitle = "Services",
  sectionKicker = "What we do",
}: Props) {
  if (!services.length) return null;
  return (
    <section id="services" className="py-28 md:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-16">
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            {sectionKicker}
          </div>
          <h2 className="font-heading text-4xl font-semibold tracking-[-0.02em] text-neutral-900 md:text-5xl">
            {sectionTitle}
          </h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {services.map((s, i) => (
            <div
              key={i}
              className="group grid gap-8 py-10 transition md:grid-cols-[140px_1fr_40px] md:items-baseline"
            >
              <div
                className="font-heading text-sm font-medium tracking-[0.18em]"
                style={{ color: "var(--brand-primary)" }}
              >
                {String(i + 1).padStart(2, "0")} —
              </div>
              <div>
                <h3 className="font-heading text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-xl leading-relaxed text-neutral-600">{s.description}</p>
              </div>
              <div
                className="hidden text-2xl text-neutral-300 transition group-hover:translate-x-1 md:block"
                style={{ color: "var(--brand-primary)" }}
              >
                →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
