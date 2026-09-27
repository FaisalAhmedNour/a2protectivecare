'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container not-found">
      <span className="eyebrow">SOMETHING WENT WRONG</span>
      <h1>Let’s try that again.</h1>
      <p>We couldn’t load this page. Your saved order remains in this browser.</p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
