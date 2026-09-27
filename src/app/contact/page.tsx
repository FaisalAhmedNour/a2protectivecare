import { MapPin } from 'lucide-react';
import { PageHeading } from '@/components/page-heading';
import { ContactForm } from '@/components/contact-form';
import { WhatsAppAction } from '@/components/whatsapp-action';
import { site } from '@/data/site';
import { content } from '@/data/content';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Contact',
  'Get in touch with A2 Protective Care about products, availability, and business inquiries.',
  '/contact/',
);
export default function Contact() {
  return (
    <>
      <PageHeading
        title={content.contact.title}
        eyebrow="Contact"
        description={content.contact.description}
      />
      <section className="container page-content contact-layout">
        <div className="contact-details">
          <span className="eyebrow">WE’RE GETTING READY TO CONNECT</span>
          <h2>
            Good conversations
            <br />
            start with a hello.
          </h2>
          <p className="small muted">{content.contact.introduction}</p>
          <dl>
            <dt>Visit us</dt>
            <dd>{site.address}</dd>
            <dt>Call</dt>
            <dd>{site.phone}</dd>
            <dt>WhatsApp</dt>
            <dd>{site.whatsappNumber}</dd>
            <dt>Email</dt>
            <dd>{site.email}</dd>
            <dt>Business hours</dt>
            <dd>{site.hours}</dd>
            {site.socials.length > 0 && (
              <>
                <dt>Social</dt>
                <dd>
                  {site.socials.map((s) => (
                    <a key={s.url} href={s.url}>
                      {s.label}
                    </a>
                  ))}
                </dd>
              </>
            )}
          </dl>
          <WhatsAppAction />
          <div className="map-placeholder">
            <MapPin size={29} strokeWidth={1.5} />
            <strong>Our location will appear here.</strong>
            <span>A map will be added once the address is confirmed.</span>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
