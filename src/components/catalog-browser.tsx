'use client';
import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import { ProductCard } from './catalog-cards';
export function CatalogBrowser({ categoryId }: { categoryId?: string }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(categoryId || 'all');
  const [sort, setSort] = useState('featured');
  const [limit, setLimit] = useState(8);
  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (category === 'all' || p.categoryId === category) &&
            `${p.name} ${p.sku ?? ''} ${categories.find((c) => c.id === p.categoryId)?.name}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'name'
            ? a.name.localeCompare(b.name)
            : sort === 'price-asc'
              ? (a.salePrice ?? a.price ?? Infinity) - (b.salePrice ?? b.price ?? Infinity)
              : Number(b.featured ?? false) - Number(a.featured ?? false),
        ),
    [category, query, sort],
  );
  const reset = () => {
    setQuery('');
    setCategory(categoryId || 'all');
    setSort('featured');
    setLimit(8);
  };
  return (
    <>
      <div className="catalog-toolbar">
        <div className="field search-field">
          <label htmlFor="search-products">Search the catalog</label>
          <div className="search-input">
            <Search size={18} />
            <input
              id="search-products"
              type="search"
              placeholder="Search products or SKU…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(8);
              }}
            />
          </div>
        </div>
        {!categoryId && (
          <div className="field filter-field">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setLimit(8);
              }}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field filter-field">
          <label htmlFor="sort-products">Sort by</label>
          <select id="sort-products" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured first</option>
            <option value="name">Name: A–Z</option>
            <option value="price-asc">Price: low to high</option>
          </select>
        </div>
      </div>
      <div className="results-line">
        <span role="status">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
        </span>
        <button className="text-button" onClick={reset}>
          Reset filters
        </button>
      </div>
      {filtered.length ? (
        <>
          <div className="product-grid catalog-grid">
            {filtered.slice(0, limit).map((p) => (
              <ProductCard key={p.id} product={p} headingLevel={2} />
            ))}
          </div>
          {limit < filtered.length && (
            <div className="load-more">
              <button className="button button-outline" onClick={() => setLimit((n) => n + 8)}>
                Load more products ({filtered.length - limit})
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <SlidersHorizontal size={35} />
          <h2>No products found.</h2>
          <p>Try a different search or reset your filters to explore the collection.</p>
          <button className="button button-primary" onClick={reset}>
            Reset filters
          </button>
        </div>
      )}
    </>
  );
}
