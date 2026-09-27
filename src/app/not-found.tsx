import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="container not-found">
      <span className="eyebrow">404 · A SMALL DETOUR</span>
      <h1>
        This page isn’t
        <br />
        in the collection.
      </h1>
      <p>The link may have changed. Let’s help you find your way back.</p>
      <div className="button-row">
        <Link href="/products/" className="button button-primary">
          Explore products
        </Link>
        <Link href="/" className="button button-outline">
          Back to home
        </Link>
      </div>
    </section>
  );
}
