import { notFound } from 'next/navigation';
import { CatalogBrowser } from '@/components/catalog-browser';
import { Breadcrumb } from '@/components/page-heading';
import { Media } from '@/components/ui/media';
import { pageMetadata } from '@/lib/seo';
import { getPublicCategories, getPublicProducts } from '@/server/repository';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = (await getPublicCategories()).find((c) => c.slug === slug);
  return c ? pageMetadata(c.name, c.description, `/categories/${c.slug}/`) : {};
}
export default async function CategoryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categoryData, productData] = await Promise.all([getPublicCategories(), getPublicProducts()]);
  const c = categoryData.find((c) => c.slug === slug);
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
            {productData.filter((p) => p.categoryId === c.id).length} products
          </p>
        </div>
        <Media src={c.image || '/images/medicine.webp'} alt={`${c.name} collection`} priority />
      </section>
      <CatalogBrowser categoryId={c.id} productData={productData} categoryData={categoryData} />
    </div>
  );
}
