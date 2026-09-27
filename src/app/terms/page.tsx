import { PageHeading } from '@/components/page-heading';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Terms of use',
  'Read the draft terms for the A2 sample catalog and WhatsApp inquiry flow.',
  '/terms/',
);
export default function Terms() {
  return (
    <>
      <PageHeading
        title="A few things to know."
        eyebrow="Terms of use"
        description="About the sample catalog and the inquiry experience."
      />
      <article className="container page-content legal">
        <p className="placeholder-note">
          Draft for business review. Replace with approved terms before launching. Effective date:
          [DATE].
        </p>
        <h2>About this preview</h2>
        <p>
          The catalog contains clearly labeled sample entries and generated concept imagery. These
          are not verified medicine listings, product recommendations, or offers for sale. Brand
          information beyond the supplied company name and green color remains to be confirmed.
        </p>
        <h2>Product inquiries</h2>
        <p>
          Adding a product to your bag prepares an inquiry. It does not reserve stock, create an
          accepted order, or collect payment. Confirm product identity, price, availability,
          delivery details, and any prescription requirements directly with the business.
        </p>
        <h2>Product information</h2>
        <p>
          Sample descriptions must not be used to make treatment decisions. Confirmed product
          information will be added before launch. [Add the approved product information and
          dispensing policies.]
        </p>
        <h2>Delivery, returns, and payment</h2>
        <p>
          [DELIVERY POLICY]
          <br />
          [RETURNS AND CANCELLATION POLICY]
          <br />
          [PAYMENT AND ORDER ACCEPTANCE POLICY]
        </p>
        <h2>Business and contact details</h2>
        <p>
          [REGISTERED BUSINESS DETAILS]
          <br />
          [APPLICABLE TERMS AND DISPUTE PROCESS]
          <br />
          [CONTACT EMAIL]
        </p>
      </article>
    </>
  );
}
