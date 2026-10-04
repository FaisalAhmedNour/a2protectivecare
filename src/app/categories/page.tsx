import { CategoryCard } from '@/components/catalog-cards';
import { PageHeading } from '@/components/page-heading';
import { ContactCTA } from '@/components/layout/footer';
import { pageMetadata } from '@/lib/seo';
import { getPublicCategories, getPublicProducts } from '@/server/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = pageMetadata(
  'Categories',
  'Explore sample medicine and care collections at A2 Protective Care.',
  '/categories/',
);

export default async function Categories() {
  const [categoryData, productData] = await Promise.all([
    getPublicCategories(),
    getPublicProducts(),
  ]);

  return (
    <>
      <PageHeading
        title="Everyday care, thoughtfully arranged."
        eyebrow="Categories"
        description="Start with a collection. Find a product. Put your questions together."
      />
      <section className="container page-content">
        <p className="placeholder-note">
          Explore our collections. All categories and products are managed directly from the care portal.
        </p>
        {categoryData.length > 0 ? (
          <div className="category-grid category-directory">
            {categoryData.map((c, i) => (
              <CategoryCard
                key={c.id}
                category={c}
                index={i}
                headingLevel={2}
                productData={productData}
              />
            ))}
          </div>
        ) : (
          <div className="empty-catalog" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p className="muted">No categories currently found.</p>
          </div>
        )}
      </section>
      <ContactCTA />
    </>
  );
}
