import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Layers, MessageCircle, ShoppingBag, Check } from 'lucide-react';
import { Media } from '@/components/ui/media';
import { WhatsAppAction } from '@/components/whatsapp-action';
import { CategoryCard, ProductCard } from '@/components/catalog-cards';
import { SectionHeading, Story, Steps, TeamGrid } from '@/components/sections';
import { ContactCTA } from '@/components/layout/footer';
import { pageMetadata } from '@/lib/seo';
import { content } from '@/data/content';
import { site } from '@/data/site';
import { getPublicCategories, getPublicProducts, getPublicTeam } from '@/server/repository';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata(
  'Care, thoughtfully connected',
  'Explore the A2 Protective Care sample medicine catalog. Browse collections and prepare your WhatsApp inquiry.',
  '/',
);
export default async function Home() {
  const [categoryData, productData, teamData] = await Promise.all([
    getPublicCategories(),
    getPublicProducts(),
    getPublicTeam(),
  ]);
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="label-line" /> {site.name.toUpperCase()}
          </span>
          <h1>
            {content.hero.headline}
            <br />
            <span>{content.hero.accent}</span>
          </h1>
          <p>{content.hero.description}</p>
          <div className="button-row">
            <Link className="button button-primary" href="/products/">
              Explore Products <ArrowUpRight size={19} />
            </Link>
            <WhatsAppAction className="hero-secondary" />
          </div>
          <div className="hero-footnote">
            <span className="tiny-cross">+</span>
            <span>{content.hero.footnote}</span>
          </div>
        </div>
        <div className="hero-visual">
          <Media
            src="/images/hero.webp"
            alt="Concept arrangement of unbranded medicine packaging on a green stone plinth"
            priority
          />
          <span className="hero-image-label">
            THE A2 COLLECTION <ArrowUpRight size={18} />
          </span>
          <div className="hero-image-card">
            <span className="card-icon">
              <ShoppingBag size={24} strokeWidth={1.5} />
            </span>
            <div>
              <strong>{content.hero.visualTitle}</strong>
              <span>{content.hero.visualDescription}</span>
            </div>
          </div>
          <span className="hero-concept">Concept imagery · sample catalog</span>
        </div>
      </section>
      <section className="trust-strip container" aria-label="Catalog features">
        {[
          { icon: Layers, title: 'Thoughtfully organized', detail: 'Browse by collection' },
          {
            icon: ShoppingBag,
            title: 'Your personal order list',
            detail: 'Keep your list in one place',
          },
          {
            icon: MessageCircle,
            title: 'Direct conversations',
            detail: 'Inquire through WhatsApp',
          },
          {
            icon: Check,
            title: 'Clarity before ordering',
            detail: 'Confirm details before purchase',
          },
        ].map((v) => (
          <div key={v.title}>
            <v.icon strokeWidth={1.4} size={25} />
            <span>
              <strong>{v.title}</strong>
              <small>{v.detail}</small>
            </span>
          </div>
        ))}
      </section>
      <section className="container section">
        <SectionHeading
          eyebrow="FIND YOUR EVERYDAY ESSENTIALS"
          title="A collection for every kind of care."
          href="/categories/"
          label="All categories"
        />
        <div className="category-grid">
          {categoryData.map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} productData={productData} />
          ))}
        </div>
      </section>
      <section className="featured-section">
        <div className="container section">
          <SectionHeading
            eyebrow="TAKE A CLOSER LOOK"
            title="Explore the sample selection."
            href="/products/"
            label="All products"
          />
          <p className="section-note">
            Illustrative listings only. Verified medicines, prices, and product information are
            coming soon.
          </p>
          <div className="product-grid">
            {productData
              .filter((p) => p.featured)
              .map((p) => (
                <ProductCard key={p.id} product={p} categoryData={categoryData} />
              ))}
          </div>
        </div>
      </section>
      <section className="catalog-banner container">
        <div>
          <span className="eyebrow">EXPLORE AT YOUR OWN PACE</span>
          <h2>
            A little more browsing.
            <br />A little less guesswork.
          </h2>
        </div>
        <Link href="/products/" className="button button-light">
          Discover the catalog <ArrowUpRight size={20} />
        </Link>
        <span className="banner-cross" aria-hidden="true">
          +
        </span>
      </section>
      <Story />
      <Steps />
      <section className="container section">
        <SectionHeading
          eyebrow="THE PEOPLE BEHIND A2"
          title="Let’s put a face to care."
          href="/team/"
          label="Meet the team"
        />
        <p className="section-note">
          Meet the people behind the brand soon. Team profiles are awaiting confirmation.
        </p>
        <TeamGrid members={teamData} />
      </section>
      <section className="gallery-preview container section">
        <SectionHeading
          eyebrow="A CLOSER LOOK"
          title="The world of A2."
          href="/gallery/"
          label="Explore gallery"
        />
        <div className="gallery-preview-grid">
          <Link href="/gallery/">
            <Media src="/images/story.webp" alt="Generated pharmacy interior concept" />
            <span>
              A vision of our space <ArrowUpRight size={18} />
            </span>
          </Link>
          <Link href="/gallery/">
            <Media src="/images/hero.webp" alt="Generated medicine packaging concept" />
            <span>
              The collection, in focus <ArrowRight size={18} />
            </span>
          </Link>
        </div>
        <p className="small muted">Concept imagery, not actual A2 premises or products.</p>
      </section>
      <ContactCTA />
    </>
  );
}
