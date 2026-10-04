import { site } from '@/data/site';
export interface ContactInput {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}
export function validateContact(input: ContactInput): string | null {
  if (input.name.trim().length < 2 || input.name.length > 100)
    return 'Enter a name between 2 and 100 characters.';
  if (!/^[+\d\s()-]{7,25}$/.test(input.phone) || input.phone.replace(/\D/g, '').length < 7)
    return 'Enter a valid phone number.';
  if (input.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 254))
    return 'Enter a valid email address.';
  if (input.subject.length > 150) return 'Keep the subject under 150 characters.';
  if (input.message.trim().length < 10 || input.message.length > 3000)
    return 'Enter a message between 10 and 3,000 characters.';
  return null;
}
export async function submitContact(
  input: ContactInput,
): Promise<{ status: 'sent' | 'unconfigured'; message: string }> {
  const invalid = validateContact(input);
  if (invalid) throw Error(invalid);
  if (!site.contactEndpoint)
    return {
      status: 'unconfigured',
      message:
        'Your message has not been sent. The contact service is not connected yet. Your entries are still here; please use WhatsApp once contact details are available.',
    };
  const endpoint = new URL(site.contactEndpoint, typeof window !== 'undefined' ? window.location.origin : site.url);
  if (!site.contactEndpoint.startsWith('/') && endpoint.protocol !== 'https:')
    throw Error(
      'The contact service is not configured correctly. Please try another contact method.',
    );
  const response = await fetch(endpoint.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw Error('The service could not accept your message. Please try again later.');
  const result: unknown = await response.json();
  if (typeof result !== 'object' || !result || !('success' in result) || result.success !== true)
    throw Error('Delivery was not confirmed. Your entries are still here; please try again.');
  return {
    status: 'sent',
    message: 'Your message was accepted by our contact service. Thank you for getting in touch.',
  };
}
