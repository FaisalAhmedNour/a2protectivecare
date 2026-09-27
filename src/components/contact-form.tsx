'use client';
import { useState, type FormEvent } from 'react';
import { site } from '@/data/site';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import { submitContact, type ContactInput } from '@/lib/contact';
export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: 'error' | 'success' | 'notice';
    text: string;
  } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) || '').trim();
    const input: ContactInput = {
      name: value('name'),
      phone: value('phone'),
      email: value('email'),
      subject: value('subject'),
      message: value('message'),
    };
    setLoading(true);
    setFeedback(null);
    try {
      const result = await submitContact(input);
      setFeedback({ kind: result.status === 'sent' ? 'success' : 'notice', text: result.message });
      if (result.status === 'sent') form.reset();
    } catch (error) {
      setFeedback({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <h2>Start a conversation.</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="contact-name">Your name</label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Full name"
          />
        </div>
        <div className="field">
          <label htmlFor="contact-phone">Phone number</label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            minLength={7}
            maxLength={25}
            placeholder="Your phone number"
          />
        </div>
        <div className="field full-width">
          <label htmlFor="contact-email">Email address (optional)</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
          />
        </div>
        <div className="field full-width">
          <label htmlFor="contact-subject">Subject (optional)</label>
          <input
            id="contact-subject"
            name="subject"
            maxLength={150}
            placeholder="How can we help?"
          />
        </div>
        <div className="field full-width">
          <label htmlFor="contact-message">Your message</label>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            placeholder="Tell us what you’d like to know…"
            aria-describedby="contact-guidance"
          />
        </div>
      </div>
      <p className="small muted" id="contact-guidance">
        For product and business inquiries. Please do not include medical records or sensitive
        health information.
      </p>
      <button className="button button-primary" type="submit" disabled={loading}>
        {loading ? (
          <>
            <LoaderCircle size={18} />
            Sending…
          </>
        ) : (
          <>
            Send inquiry <ArrowUpRight size={18} />
          </>
        )}
      </button>
      {feedback && (
        <div
          className={`form-message ${feedback.kind}`}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </div>
      )}
      {!site.contactEndpoint && (
        <p className="small muted">
          The contact service is awaiting setup. No message will be sent until it is connected.
        </p>
      )}
    </form>
  );
}
