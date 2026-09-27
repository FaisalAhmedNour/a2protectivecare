import { PageHeading } from '@/components/page-heading';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Privacy policy',
  'Read how the A2 sample website handles your local order list and inquiries.',
  '/privacy/',
);
export default function Privacy() {
  return (
    <>
      <PageHeading
        title="Your privacy."
        eyebrow="Privacy policy"
        description="How this preview handles information while you browse."
      />
      <article className="container page-content legal">
        <p className="placeholder-note">
          Draft for business review. Replace with an approved privacy policy before launching.
          Effective date: [DATE].
        </p>
        <h2>Your order list</h2>
        <p>
          The website stores product identifiers and quantities in your browser’s local storage so
          your list remains available after a refresh. Clear your order list or your browser’s site
          data to remove it. No payment details are collected.
        </p>
        <h2>Contact inquiries</h2>
        <p>
          The form collects the name, phone number, email, subject, and message you enter. In this
          preview, the contact service is not connected and messages are not sent. Once connected,
          an updated policy must identify the receiving service, use, retention, and contact
          details.
        </p>
        <h2>WhatsApp</h2>
        <p>
          A WhatsApp link prepares a message containing the selected product details and quantities.
          You review and send the message in WhatsApp. Your use of that service is governed by its
          own privacy terms.
        </p>
        <h2>Hosting and other services</h2>
        <p>
          The hosting provider may process technical request information to deliver the website.
          [Add verified hosting practices, retention periods, and any additional service providers.]
          No analytics or advertising tools have been added to this implementation.
        </p>
        <h2>Questions about your information</h2>
        <p>
          [PRIVACY CONTACT EMAIL]
          <br />
          [DATA CONTROLLER DETAILS]
          <br />
          [APPROVED INFORMATION REQUEST PROCESS]
        </p>
      </article>
    </>
  );
}
