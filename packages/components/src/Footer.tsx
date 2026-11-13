type Props = {
  logo?: string;
  contact?: { email?: string; phone?: string; address?: string };
  name?: string;
  tagline?: string;
};

export default function Footer({ logo, contact, name = "", tagline }: Props) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-neutral-200 bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            {logo && <img src={logo} alt="" className="h-9 w-auto" />}
            <span className="font-heading text-lg font-semibold tracking-tight text-neutral-900">
              {name}
            </span>
          </div>
          {tagline && (
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">{tagline}</p>
          )}
        </div>
        <div className="text-sm text-neutral-600">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Contact
          </div>
          {contact?.email && (
            <a href={`mailto:${contact.email}`} className="block hover:text-neutral-900">
              {contact.email}
            </a>
          )}
          {contact?.phone && <div>{contact.phone}</div>}
        </div>
        <div className="text-sm text-neutral-600">
          {contact?.address && (
            <>
              <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Address
              </div>
              <div>{contact.address}</div>
            </>
          )}
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-neutral-100 px-6 pt-6 text-xs text-neutral-400">
        © {year} {name}. All rights reserved.
      </div>
    </footer>
  );
}
