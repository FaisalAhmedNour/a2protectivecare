import { HeartHandshake, Focus, Leaf } from 'lucide-react';
import { PageHeading } from '@/components/page-heading';
import { Media } from '@/components/ui/media';
import { Steps } from '@/components/sections';
import { ContactCTA } from '@/components/layout/footer';
import { pageMetadata } from '@/lib/seo';
import { content } from '@/data/content';
export const metadata = pageMetadata(
  'About A2',
  'Get to know A2 Protective Care and explore a simpler way to connect about medicines.',
  '/about/',
);
export default function About() {
  return (
    <>
      <PageHeading
        title={content.about.title}
        eyebrow="About A2"
        description={content.about.introduction}
      />
      <section className="container content-split page-content">
        <Media
          src="/images/story.webp"
          alt="Generated concept of pharmacy shelving, not an actual A2 location"
          priority
        />
        <div>
          <span className="eyebrow">OUR STORY</span>
          <h2>{content.about.storyTitle}</h2>
          <p className="placeholder-note">{content.about.story}</p>
        </div>
      </section>
      <section className="container page-content">
        <div className="values-grid">
          {[
            {
              icon: Focus,
              title: 'Our mission',
              text: content.about.mission,
            },
            {
              icon: Leaf,
              title: 'Our vision',
              text: content.about.vision,
            },
            {
              icon: HeartHandshake,
              title: 'Our values',
              text: content.about.values,
            },
          ].map((v) => (
            <article className="value-card" key={v.title}>
              <v.icon size={28} strokeWidth={1.4} />
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </section>
      <Steps />
      <ContactCTA />
    </>
  );
}
