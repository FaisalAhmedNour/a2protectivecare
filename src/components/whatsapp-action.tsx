'use client';
import { useState } from 'react';
import { MessageCircle, Copy, Check, LoaderCircle, ArrowUpRight } from 'lucide-react';
import {
  generateWhatsAppOrderUrl,
  generateWhatsAppContactUrl,
  buildOrderMessage,
  type OrderItem,
} from '@/lib/whatsapp';
import { Dialog } from '@/components/ui/dialog';
import { site } from '@/data/site';
export function WhatsAppAction({
  items,
  children = 'Order on WhatsApp',
  className = 'button button-primary',
  ariaLabel,
}: {
  items?: OrderItem[];
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const url = items ? generateWhatsAppOrderUrl({ items }) : generateWhatsAppContactUrl();
  const message = items?.length ? buildOrderMessage(items) : site.contactGreeting;
  return (
    <>
      {url && !items?.length ? (
        <a
          className={className}
          aria-label={ariaLabel}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={18} />
          {children}
        </a>
      ) : url && items?.length ? (
        <button className={className} aria-label={ariaLabel} onClick={() => setDetailsOpen(true)}><MessageCircle size={18} />{children}</button>
      ) : (
        <button className={className} aria-label={ariaLabel} onClick={() => setOpen(true)}>
          <MessageCircle size={18} />
          {children}
        </button>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} title="WhatsApp contact coming soon">
        <p>
          The company’s WhatsApp number has not been added yet. Your inquiry is ready to copy; it
          has not been sent.
        </p>
        <textarea
          className="message-preview"
          aria-label="Prepared inquiry"
          value={message}
          readOnly
          rows={8}
        />
        <button
          className="button button-primary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(message);
              setCopied(true);
              setError('');
            } catch {
              setError('Copy unavailable. Select the message above and copy it manually.');
            }
          }}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copied' : 'Copy inquiry'}
        </button>
        <p role="status" className="small">
          {error || (copied ? 'Your inquiry was copied.' : '')}
        </p>
      </Dialog>
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Your delivery details">
        <p className="small muted">Save your details with this inquiry before WhatsApp opens.</p>
        <form className="customer-form" onSubmit={async (event) => { event.preventDefault(); if (!items?.length || !url) return; setSaving(true); setError(''); const data = new FormData(event.currentTarget); const value = (key: string) => String(data.get(key) || '').trim(); try { const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: value('name'), phone: value('phone'), address: value('address'), items: items.map(({ product, quantity }) => ({ productId: product.id, name: product.name, quantity, unitPrice: product.salePrice ?? product.price, subtotal: product.price === undefined && product.salePrice === undefined ? undefined : (product.salePrice ?? product.price)! * quantity })), message }) }); const result = await response.json().catch(() => ({})); if (!response.ok) setError(result.error || 'Could not save your inquiry.'); else { setDetailsOpen(false); window.open(url, '_blank', 'noopener,noreferrer'); } } catch { setError('Could not save your inquiry. Please try again.'); } finally { setSaving(false); } }}>
          <label>Your name<input name="name" required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label>Phone number<input name="phone" required type="tel" minLength={7} maxLength={25} autoComplete="tel" /></label>
          <label>Delivery address<textarea name="address" required minLength={5} maxLength={500} rows={3} autoComplete="street-address" /></label>
          {error && <p className="form-message error" role="alert">{error}</p>}
          <button className="button button-primary" disabled={saving}>{saving ? <><LoaderCircle size={18} /> Saving inquiry…</> : <>Save and open WhatsApp <ArrowUpRight size={18} /></>}</button>
        </form>
      </Dialog>
    </>
  );
}
