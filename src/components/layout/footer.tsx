import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { site } from '@/data/site';
import { content } from '@/data/content';
import { categories } from '@/data/categories';
import { Logo } from './header';
import { WhatsAppAction } from '../whatsapp-action';
export function ContactCTA() {
  return (
    <section className="contact-cta container">
      <div>
        <span className="eyebrow">LET’S TALK</span>
        <h2>{content.contactCTA.title}</h2>
        <p>{content.contactCTA.description}</p>
      </div>
      <div className="button-row">
        <WhatsAppAction />
        <Link href="/contact/" className="button button-outline">
          Contact us <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{site.footerDescription}</p>
          <span className="small footer-note">Sample catalog · product details pending</span>
        </div>
        <div>
          <h2>Explore</h2>
          {['About', 'Products', 'Team', 'Gallery', 'Contact'].map((n) => (
            <Link key={n} href={`/${n.toLowerCase()}/`}>
              {n}
            </Link>
          ))}
        </div>
        <div>
          <h2>Collections</h2>
          {categories.map((c) => (
            <Link key={c.id} href={`/categories/${c.slug}/`}>
              {c.name}
            </Link>
          ))}
        </div>
        <div>
          <h2>Get in touch</h2>
          <p>
            {site.email}
            <br />
            {site.phone}
            <br />
            {site.address}
          </p>
          {site.socials.length > 0 &&
            site.socials.map((s) => (
              <a key={s.url} href={s.url}>
                {s.label}
              </a>
            ))}
          <WhatsAppAction className="footer-chat" />
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} A2 Protective Care.</span>
        <div>
          <Link href="/privacy/">Privacy policy</Link>
          <Link href="/terms/">Terms of use</Link>
        </div>
        <span>Care, thoughtfully connected.</span>
      </div>
    </footer>
  );
}
