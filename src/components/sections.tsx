import Link from 'next/link';
import { ArrowUpRight, ClipboardList, MessageCircle, ShoppingBag, UserRound } from 'lucide-react';
import type { TeamMember } from '@/types/catalog';
import { team } from '@/data/team';
import { content } from '@/data/content';
import { Media } from './ui/media';
export function SectionHeading({
  eyebrow,
  title,
  href,
  label = 'View all',
}: {
  eyebrow: string;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {label}
          <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}
export function Story() {
  return (
    <section className="story container section">
      <div className="story-image">
        <Media
          src="/images/story.webp"
          alt="Generated concept of a calm pharmacy space, not an actual A2 location"
        />
        <span className="image-caption">A vision of care · concept image</span>
      </div>
      <div className="story-copy">
        <span className="eyebrow">{content.story.eyebrow}</span>
        <h2>{content.story.title}</h2>
        <p>{content.story.introduction}</p>
        <p className="muted">{content.story.description}</p>
        <Link className="text-link" href="/about/">
          Discover A2 <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
export function Steps() {
  return (
    <section className="steps-section">
      <div className="container section">
        <SectionHeading
          eyebrow="WHY CHOOSE THE A2 EXPERIENCE"
          title="From browsing to a conversation."
        />
        <div className="steps-grid">
          {[
            {
              icon: ClipboardList,
              title: 'Explore the catalog',
              text: 'Find a collection and take a closer look at the products.',
            },
            {
              icon: ShoppingBag,
              title: 'Build your inquiry',
              text: 'Add items and quantities to your personal order list.',
            },
            {
              icon: MessageCircle,
              title: 'Connect on WhatsApp',
              text: 'Share your list to ask about pricing and availability.',
            },
          ].map((s, i) => (
            <div key={s.title} className="step">
              <div className="step-top">
                <s.icon size={27} strokeWidth={1.4} />
                <span>0{i + 1}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function TeamGrid({
  members,
  headingLevel = 3,
}: {
  members?: TeamMember[];
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const list = members && members.length > 0 ? members : team;
  return (
    <div className="team-grid">
      {list.map((m, i) => (
        <article key={m.id || i} className="team-card">
          <div className={`team-photo team-photo-${i % 3}`}>
            {m.photo ? (
              <Media src={m.photo} alt={m.name} sizes="(max-width: 700px) 100vw, 33vw" />
            ) : (
              <>
                <UserRound size={80} strokeWidth={0.8} />
                <span>PHOTO TO BE ADDED</span>
              </>
            )}
          </div>
          <Heading>{m.name}</Heading>
          <span className="small muted">{m.designation}</span>
          <p>{m.bio}</p>
          {!!m.social?.length && (
            <div className="team-socials">
              {m.social.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
