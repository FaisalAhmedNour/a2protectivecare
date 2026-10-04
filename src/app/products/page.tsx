import { CatalogBrowser } from '@/components/catalog-browser';
import { PageHeading } from '@/components/page-heading';
import { pageMetadata } from '@/lib/seo';
import { getPublicCategories, getPublicProducts } from '@/server/repository';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = pageMetadata(
  'Products',
  'Browse the sample A2 medicine catalog, filter collections, and prepare a product inquiry.',
  '/products/',
);
export default async function Products() {
  const [productData, categoryData] = await Promise.all([getPublicProducts(), getPublicCategories()]);
  return (
    <>
      <PageHeading
        title="Find your next essential."
        eyebrow="Products"
        description="Browse the collection, take a closer look, and keep the items you want to ask about together."
      />
      <section className="container page-content">
        <p className="placeholder-note">
          Sample catalog — these entries are illustrative, not verified medicines or offers for
          sale. Real product information is awaiting confirmation.
        </p>
        <CatalogBrowser productData={productData} categoryData={categoryData} />
      </section>
    </>
  );
}
