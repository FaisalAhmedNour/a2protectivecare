export default function Loading() {
  return (
    <div className="container section" role="status" aria-label="Loading page">
      <p>Preparing your page…</p>
      <div className="product-grid" style={{ marginTop: 25 }}>
        {[0, 1, 2, 3].map((n) => (
          <div className="skeleton" key={n} />
        ))}
      </div>
    </div>
  );
}
