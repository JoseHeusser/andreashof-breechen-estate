import type { ReactNode } from "react";

const WHATSAPP_NUMBER = "491723813606";
const EMAIL = "andrea.lietz@web.de";

// Shared building blocks for the small add-on service pages
// (/pferdeboxen, /fruehstueckservice).

export function ServiceList({ title, items }: { title?: string; items: string[] }) {
  return (
    <div>
      {title ? <h2 className="font-display text-2xl font-light md:text-3xl">{title}</h2> : null}
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-base leading-relaxed text-muted-foreground md:text-[1.05rem]"
          >
            <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-sage-deep" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServicePrice({
  label,
  price,
  unit,
  note,
}: {
  label: string;
  price: string;
  unit: string;
  note?: string;
}) {
  return (
    <div className="border border-border bg-linen px-6 py-8 text-center md:px-10">
      <span className="eyebrow">{label}</span>
      <p className="mt-3 font-display text-5xl font-light text-foreground md:text-6xl">{price}</p>
      <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">{unit}</p>
      {note ? <p className="mt-4 text-sm italic text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function ServiceContact({
  message,
  subject,
  whatsappLabel,
  emailLabel,
}: {
  message: string;
  subject: string;
  whatsappLabel: ReactNode;
  emailLabel: ReactNode;
}) {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  return (
    <div className="flex flex-col justify-center gap-3 sm:flex-row">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="min-h-11 border border-foreground bg-foreground px-6 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-background transition-colors hover:border-sage-deep hover:bg-sage-deep md:px-8 md:tracking-[0.28em]"
      >
        {whatsappLabel}
      </a>
      <a
        href={mailHref}
        className="min-h-11 border border-foreground/60 px-6 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground/5 md:px-8 md:tracking-[0.28em]"
      >
        {emailLabel}
      </a>
    </div>
  );
}
