import { categories } from '@/data/categories';
import { CategoryCard } from '@/components/catalog-cards';
import { PageHeading } from '@/components/page-heading';
import { ContactCTA } from '@/components/layout/footer';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Categories',
  'Explore sample medicine and care collections at A2 Protective Care.',
  '/categories/',
);
export default function Categories() {
  return (
    <>
      <PageHeading
        title="Everyday care, thoughtfully arranged."
        eyebrow="Categories"
        description="Start with a collection. Find a product. Put your questions together."
      />
      <section className="container page-content">
        <p className="placeholder-note">
          Proposed collections for the sample catalog. Actual ranges will be confirmed before
          launch.
        </p>
        <div className="category-grid category-directory">
          {categories.map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} headingLevel={2} />
          ))}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
