import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <Link href="/">Home</Link>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <ChevronRight size={13} aria-hidden="true" />
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function PageHeading({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description: string;
}) {
  return (
    <section className="page-hero container">
      <Breadcrumb items={[{ label: eyebrow }]} />
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
