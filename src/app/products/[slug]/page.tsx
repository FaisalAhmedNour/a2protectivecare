import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products, getProduct } from '@/data/products';
import { categories } from '@/data/categories';
import { ProductGallery, ProductPurchase } from '@/components/product-purchase';
import { ProductCard } from '@/components/catalog-cards';
import { Breadcrumb } from '@/components/page-heading';
import { SectionHeading } from '@/components/sections';
import { formatPrice } from '@/lib/utils';
import { pageMetadata } from '@/lib/seo';
export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? pageMetadata(p.name, p.shortDescription, `/products/${p.slug}/`) : {};
}
export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const category = categories.find((c) => c.id === p.categoryId)!;
  return (
    <div className="container page-content">
      <div className="page-hero">
        <Breadcrumb items={[{ label: 'Products', href: '/products/' }, { label: p.name }]} />
      </div>
      <section className="product-detail">
        <ProductGallery product={p} />
        <div className="product-information">
          <Link className="eyebrow" href={`/categories/${category.slug}/`}>
            {category.name}
          </Link>
          <h1>{p.name}</h1>
          <div className="price-line">
            {formatPrice(p.salePrice ?? p.price)}
            {p.salePrice !== undefined && p.price !== undefined && (
              <del>{formatPrice(p.price)}</del>
            )}
          </div>
          <p>{p.shortDescription}</p>
          <div className="product-status">
            {p.sku && <span>SKU: {p.sku}</span>}
            <span>
              {p.inStock === false
                ? 'Unavailable'
                : p.inStock
                  ? 'Available for inquiry'
                  : 'Availability to be confirmed'}
            </span>
          </div>
          <ProductPurchase product={p} />
          {p.sample && (
            <div className="product-disclosure">
              <strong>Sample listing.</strong> This is a catalog demonstration, not medical advice
              or a medicine recommendation.
            </div>
          )}
        </div>
      </section>
      <section className={`details-grid ${!p.specifications?.length ? 'details-single' : ''}`}>
        <div>
          <h2>About this product</h2>
          <p>{p.description}</p>
          {!!p.features?.length && (
            <ul>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
        {!!p.specifications?.length && (
          <div>
            <h2>Product information</h2>
            <dl className="specifications">
              {p.specifications.map(({ label, value }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>
      <section>
        <SectionHeading
          eyebrow="KEEP EXPLORING"
          title="In the same collection."
          href={`/categories/${category.slug}/`}
          label="View collection"
        />
        <div className="product-grid">
          {products
            .filter((item) => item.categoryId === p.categoryId && item.id !== p.id)
            .slice(0, 4)
            .map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
        </div>
      </section>
    </div>
  );
}
