type Props = {
  services: { title: string; description: string }[];
  images?: string[];
  sectionTitle?: string;
  sectionKicker?: string;
};

export default function ServicesA({
  services,
  images = [],
  sectionTitle = "What we do",
  sectionKicker = "Services",
}: Props) {
  if (!services.length) return null;
  return (
    <section id="services" className="relative bg-neutral-50 py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            {sectionKicker}
          </div>
          <h2 className="font-heading text-4xl font-semibold tracking-[-0.02em] text-neutral-900 md:text-5xl">
            {sectionTitle}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={i}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:shadow-xl hover:ring-neutral-300"
            >
              {images[i] && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={images[i]}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-7">
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: "var(--brand-primary)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-heading text-xl font-semibold tracking-tight text-neutral-900">
                  {s.title}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-neutral-600">{s.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
