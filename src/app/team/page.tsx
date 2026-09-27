import { TeamGrid } from '@/components/sections';
import { PageHeading } from '@/components/page-heading';
import { ContactCTA } from '@/components/layout/footer';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Our team',
  'Meet the people behind A2 Protective Care. Verified team profiles are coming soon.',
  '/team/',
);
export default function Team() {
  return (
    <>
      <PageHeading
        title="The people behind the care."
        eyebrow="Our team"
        description="A space for the faces, experience, and stories of the people behind A2 Protective Care."
      />
      <section className="container page-content">
        <p className="placeholder-note">
          Team introductions are coming soon. The entries below are placeholders, not employee or
          qualification claims.
        </p>
        <TeamGrid headingLevel={2} />
      </section>
      <ContactCTA />
    </>
  );
}
