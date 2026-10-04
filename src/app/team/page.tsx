import { TeamGrid } from '@/components/sections';
import { PageHeading } from '@/components/page-heading';
import { ContactCTA } from '@/components/layout/footer';
import { getPublicTeam } from '@/server/repository';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = pageMetadata(
  'Our team',
  'Meet the people behind A2 Protective Care. Verified team profiles and leadership.',
  '/team/',
);

export default async function Team() {
  const teamMembers = await getPublicTeam();

  return (
    <>
      <PageHeading
        title="The people behind the care."
        eyebrow="Our team"
        description="A space for the faces, experience, and stories of the people behind A2 Protective Care."
      />
      <section className="container page-content">
        <TeamGrid members={teamMembers} headingLevel={2} />
      </section>
      <ContactCTA />
    </>
  );
}
