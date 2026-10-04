import type { Product } from '@/types/catalog';
// DEVELOPMENT DEMO DATA ONLY. These formats are not actual A2 products.
// Prices below are development-only sample BDT values so the catalog and Order List can be exercised.
const samples = [
  ['tablet-format', 'Tablet format', 'category-one', 'medicine'],
  ['oral-liquid-format', 'Oral liquid format', 'category-one', 'wellness'],
  ['capsule-format', 'Capsule format', 'category-two', 'medicine'],
  ['dressing-format', 'Dressing format', 'category-three', 'first-aid'],
  ['care-bottle-format', 'Care bottle format', 'category-four', 'wellness'],
  ['boxed-care-format', 'Boxed care format', 'category-four', 'essentials'],
  ['first-aid-pack', 'First-aid pack', 'category-three', 'essentials'],
  ['wellness-pack', 'Wellness pack', 'category-two', 'first-aid'],
  ['medicine-pack', 'Medicine pack', 'category-one', 'essentials'],
];
export const products: Product[] = samples.map(([slug, name, categoryId, image], i) => ({
  id: slug,
  slug,
  name,
  categoryId,
  sku: `SAMPLE-${String(i + 1).padStart(3, '0')}`,
  shortDescription:
    'Sample catalog entry. Actual product, price, and availability are awaiting confirmation.',
  description:
    'This entry demonstrates the catalog experience. It is not a verified medicine or an offer for sale. The confirmed product name, manufacturer, approved information, and any prescription requirements will appear here before launch.',
  featured: i < 4,
  newArrival: false,
  price: [280, 360, 420, 190, 520, 680, 450, 390, 740][i],
  images: [`/images/${image}.webp`, '/images/hero.webp'],
  features: [
    'Product information awaiting verification',
    'Availability confirmed with your inquiry',
    'No payment is taken on this website',
  ],
  specifications:
    i === 0
      ? [
          { label: 'Product name', value: '[VERIFIED PRODUCT NAME]' },
          { label: 'Manufacturer', value: '[MANUFACTURER]' },
          { label: 'Pack size', value: '[PACK SIZE]' },
          { label: 'Prescription status', value: '[TO BE VERIFIED]' },
        ]
      : undefined,
  sample: true,
}));
export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
