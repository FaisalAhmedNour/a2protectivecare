import { GalleryViewer } from '@/components/gallery-viewer';
import { PageHeading } from '@/components/page-heading';
import { pageMetadata } from '@/lib/seo';
import { getPublicGallery } from '@/server/repository';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata(
  'Gallery',
  'Explore the visual concept for A2 Protective Care. Actual business and product photographs are coming soon.',
  '/gallery/',
);
export default async function Gallery() {
  const gallery = await getPublicGallery();
  return (
    <>
      <PageHeading
        title="A closer look at our world."
        eyebrow="Gallery"
        description="A visual introduction to the A2 concept. Select an image to explore the details."
      />
      <section className="container page-content">
        <p className="placeholder-note">
          All images are generated concepts. They do not depict actual A2 premises, products, or
          staff.
        </p>
        <GalleryViewer gallery={gallery} />
      </section>
    </>
  );
}
