import { MapPin } from 'lucide-react';
import { PageHeading } from '@/components/page-heading';
import { ContactForm } from '@/components/contact-form';
import { WhatsAppAction } from '@/components/whatsapp-action';
import { site } from '@/data/site';
import { getPublicContactInfo } from '@/server/repository';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = pageMetadata(
  'Contact',
  'Get in touch with A2 Protective Care about products, availability, and business inquiries.',
  '/contact/',
);

export default async function Contact() {
  const contact = await getPublicContactInfo();
  const rawWhatsApp = contact.whatsappNumber.replace(/[\s()+-]/g, '');

  return (
    <>
      <PageHeading
        title={contact.title || 'Let’s talk about what you need.'}
        eyebrow="Contact"
        description={contact.description || 'A product question, an availability inquiry, or a business conversation. Start here.'}
      />
      <section className="container page-content contact-layout">
        <div className="contact-details">
          <span className="eyebrow">WE’RE GETTING READY TO CONNECT</span>
          <h2>
            Good conversations
            <br />
            start with a hello.
          </h2>
          <p className="small muted">{contact.introduction || 'Good conversations start with a hello. Connect directly with our team.'}</p>
          <dl>
            <dt>Visit us</dt>
            <dd>{contact.address || site.address}</dd>
            <dt>Call</dt>
            <dd>
              <a href={`tel:${(contact.phone || site.phone).replace(/[\s()-]/g, '')}`}>
                {contact.phone || site.phone}
              </a>
            </dd>
            <dt>WhatsApp</dt>
            <dd>
              <a
                href={rawWhatsApp ? `https://wa.me/${rawWhatsApp}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contact.whatsappNumber || site.whatsappNumber}
              </a>
            </dd>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${contact.email || site.email}`}>
                {contact.email || site.email}
              </a>
            </dd>
            <dt>Business hours</dt>
            <dd>{contact.hours || site.hours}</dd>
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
          {contact.mapUrl ? (
            <div
              className="contact-map-wrapper"
              style={{
                marginTop: 24,
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <iframe
                src={contact.mapUrl}
                width="100%"
                height="240"
                style={{ border: 0, display: 'block' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Business Location Map"
              />
            </div>
          ) : (
            <div className="map-placeholder">
              <MapPin size={29} strokeWidth={1.5} />
              <strong>{contact.address || 'Our location will appear here.'}</strong>
              <span>A map will be added once the map embed URL is configured in admin.</span>
            </div>
          )}
        </div>
        <ContactForm />
      </section>
    </>
  );
}
