import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOrderMessage,
  generateWhatsAppOrderUrl,
  normalizeWhatsAppNumber,
} from '../src/lib/whatsapp';
import { sanitizeOrder } from '../src/lib/order';
import { products } from '../src/data/products';
import { validateContact, submitContact } from '../src/lib/contact';
import { site } from '../src/data/site';
test('WhatsApp single inquiry encodes Unicode and punctuation and contains product URL/SKU/quantity', () => {
  const product = { ...products[0], name: 'Care & A+B / বাংলা', price: 120, salePrice: 100 };
  const url = generateWhatsAppOrderUrl({
    product,
    quantity: 2,
    number: '+880 (1700) 000-000',
    origin: 'https://example.com',
  });
  assert.ok(url);
  const parsed = new URL(url);
  assert.equal(parsed.pathname, '/8801700000000');
  const message = parsed.searchParams.get('text')!;
  assert.match(message, /Care & A\+B \/ বাংলা/);
  assert.match(message, /Quantity: 2/);
  assert.match(message, /SAMPLE-001/);
  assert.match(message, /100/);
  assert.match(message, /https:\/\/example.com\/products\/tablet-format\//);
});
test('multiple products keep individual quantities and include configured prices', () => {
  const message = buildOrderMessage([
    { product: products[0], quantity: 2 },
    { product: products[1], quantity: 1 },
  ]);
  assert.match(message, /1\. Tablet format/);
  assert.match(message, /2\. Oral liquid format/);
  assert.match(message, /Quantity: 2/);
  assert.match(message, /Quantity: 1/);
  assert.match(message, /Unit price: ৳280/);
});
test('no URL is generated for missing or invalid number', () => {
  for (const number of ['', '[WHATSAPP NUMBER]', 'javascript:1', '123', '0000000000'])
    assert.equal(generateWhatsAppOrderUrl({ product: products[0], number }), null);
  assert.equal(normalizeWhatsAppNumber('+880 1700 000000'), '8801700000000');
});
test('empty orders and invalid quantities are rejected', () => {
  assert.throws(() => buildOrderMessage([]));
  for (const quantity of [0, -1, 100, NaN, 1.5])
    assert.throws(() => buildOrderMessage([{ product: products[0], quantity }]));
});
test('stale, malformed and malicious order records are discarded; duplicates merge and cap', () => {
  assert.deepEqual(sanitizeOrder(null), []);
  assert.deepEqual(
    sanitizeOrder([
      { productId: 'gone', quantity: 1 },
      null,
      {},
      { productId: products[0].id, quantity: '3' },
      { productId: products[0].id, quantity: -1 },
    ]),
    [],
  );
  assert.deepEqual(
    sanitizeOrder([
      { productId: products[0].id, quantity: 98 },
      { productId: products[0].id, quantity: 3 },
    ]),
    [{ productId: products[0].id, quantity: 99 }],
  );
});
const contact = {
  name: 'Test Person',
  phone: '+8801700000000',
  email: 'test@example.com',
  subject: 'Catalog inquiry',
  message: 'Please confirm product availability.',
};
test('contact validates lengths and identifiers', () => {
  assert.equal(validateContact(contact), null);
  assert.equal(validateContact({ ...contact, email: '', subject: '' }), null);
  assert.ok(validateContact({ ...contact, name: 'x' }));
  assert.ok(validateContact({ ...contact, email: 'invalid' }));
  assert.ok(validateContact({ ...contact, message: 'hi' }));
  assert.ok(validateContact({ ...contact, phone: 'no phone' }));
});
test('local contact endpoint can acknowledge a saved message', async () => {
  const originalEndpoint = site.contactEndpoint;
  const originalFetch = globalThis.fetch;
  site.contactEndpoint = 'https://contact.example.test/inquiries';
  globalThis.fetch = async () => new Response(JSON.stringify({ success: true }), { status: 200 });
  try { assert.equal((await submitContact(contact)).status, 'sent'); }
  finally { site.contactEndpoint = originalEndpoint; globalThis.fetch = originalFetch; }
});
test('configured contact requires explicit server acknowledgement and preserves failures', async () => {
  const originalEndpoint = site.contactEndpoint;
  const originalFetch = globalThis.fetch;
  site.contactEndpoint = 'https://contact.example.test/inquiries';
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ success: true }), { status: 200 });
    assert.equal((await submitContact(contact)).status, 'sent');
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: false }), { status: 200 });
    await assert.rejects(submitContact(contact), /Delivery was not confirmed/);
    globalThis.fetch = async () => new Response('Unavailable', { status: 503 });
    await assert.rejects(submitContact(contact), /could not accept/);
    site.contactEndpoint = 'http://contact.example.test/inquiries';
    await assert.rejects(submitContact(contact), /not configured correctly/);
  } finally {
    site.contactEndpoint = originalEndpoint;
    globalThis.fetch = originalFetch;
  }
});
