import { site } from '@/data/site';
import type { Product } from '@/types/catalog';
import { formatPrice } from './utils';
export interface OrderItem {
  product: Product;
  quantity: number;
}
export function normalizeWhatsAppNumber(raw: string) {
  const number = raw.replace(/[\s()+-]/g, '');
  return /^[1-9]\d{6,14}$/.test(number) ? number : null;
}
export function buildOrderMessage(items: OrderItem[], origin = site.url) {
  if (!items.length) throw new Error('Add a product before preparing an inquiry.');
  const single = items.length === 1;
  return [
    single ? site.singleOrderGreeting : site.orderGreeting,
    '',
    ...items.map(({ product, quantity }, i) => {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99)
        throw new Error('Quantity must be between 1 and 99.');
      return [
        `${single ? 'Product:' : `${i + 1}.`} ${product.name}${product.sample ? ' [SAMPLE]' : ''}`,
        `   Quantity: ${quantity}`,
        product.sku ? `   SKU: ${product.sku}` : '',
        product.price !== undefined
          ? `   Unit price: ${formatPrice(product.salePrice ?? product.price)}`
          : '',
        `   Product link: ${new URL(`/products/${product.slug}/`, origin).toString()}`,
      ]
        .filter(Boolean)
        .join('\n');
    }),
    '',
    single ? site.singleOrderClosing : site.orderClosing,
  ].join('\n');
}
export function generateWhatsAppOrderUrl({
  product,
  quantity,
  items,
  number = site.whatsappNumber,
  origin = site.url,
}: {
  product?: Product;
  quantity?: number;
  items?: OrderItem[];
  number?: string;
  origin?: string;
}) {
  const phone = normalizeWhatsAppNumber(number);
  if (!phone) return null;
  const lines = items ?? (product ? [{ product, quantity: quantity ?? 1 }] : []);
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildOrderMessage(lines, origin))}`;
}
export function generateWhatsAppContactUrl(message = site.contactGreeting) {
  const number = normalizeWhatsAppNumber(site.whatsappNumber);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}
