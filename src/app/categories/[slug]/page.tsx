import { notFound } from 'next/navigation';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import { CatalogBrowser } from '@/components/catalog-browser';
import { Breadcrumb } from '@/components/page-heading';
import { Media } from '@/components/ui/media';
import { pageMetadata } from '@/lib/seo';
export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = categories.find((c) => c.slug === slug);
  return c ? pageMetadata(c.name, c.description, `/categories/${c.slug}/`) : {};
}
export default async function CategoryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = categories.find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <div className="container page-content">
      <div className="page-hero">
        <Breadcrumb items={[{ label: 'Categories', href: '/categories/' }, { label: c.name }]} />
      </div>
      <section className="category-intro">
        <div>
          <span className="eyebrow">THE A2 COLLECTION</span>
          <h1>{c.name}</h1>
          <p>{c.description}</p>
          <p className="small muted" style={{ marginTop: 22 }}>
            {products.filter((p) => p.categoryId === c.id).length} sample products
          </p>
        </div>
        <Media src={c.image} alt={`${c.name} sample packaging concept`} priority />
      </section>
      <CatalogBrowser categoryId={c.id} />
    </div>
  );
}
