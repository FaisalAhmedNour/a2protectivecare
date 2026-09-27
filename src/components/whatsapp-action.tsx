'use client';
import { useState } from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
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
  const url = items ? generateWhatsAppOrderUrl({ items }) : generateWhatsAppContactUrl();
  const message = items?.length ? buildOrderMessage(items) : site.contactGreeting;
  return (
    <>
      {url ? (
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
    </>
  );
}
