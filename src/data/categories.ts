import type { Category } from '@/types/catalog';
// DEVELOPMENT PLACEHOLDERS: actual A2 category names have not been supplied.
// Replace these records and their concept images when the business range is approved.
export const categories: Category[] = [
  {
    id: 'category-one',
    slug: 'category-one',
    name: 'Category One',
    description: '[CATEGORY DESCRIPTION] — Temporary collection for the sample catalog.',
    image: '/images/medicine.webp',
    featured: true,
  },
  {
    id: 'category-two',
    slug: 'category-two',
    name: 'Category Two',
    description: '[CATEGORY DESCRIPTION] — This placeholder is ready for an approved collection.',
    image: '/images/wellness.webp',
    featured: true,
  },
  {
    id: 'category-three',
    slug: 'category-three',
    name: 'Category Three',
    description:
      '[CATEGORY DESCRIPTION] — The real collection name and details will be added here.',
    image: '/images/first-aid.webp',
    featured: true,
  },
  {
    id: 'category-four',
    slug: 'category-four',
    name: 'Category Four',
    description:
      '[CATEGORY DESCRIPTION] — Explore sample entries while the range is being prepared.',
    image: '/images/essentials.webp',
    featured: true,
  },
];
