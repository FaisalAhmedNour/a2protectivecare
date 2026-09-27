import type { GalleryItem } from '@/types/catalog';
export const gallery: GalleryItem[] = [
  {
    id: 'collection',
    image: '/images/hero.webp',
    title: 'A considered collection',
    description: 'Generated concept image. Not a photograph of actual products.',
    category: 'Collection concept',
    order: 0,
  },
  {
    id: 'space',
    image: '/images/story.webp',
    title: 'Space for better care',
    description: 'Generated pharmacy concept. Not an A2 location.',
    category: 'Space concept',
    order: 1,
  },
  {
    id: 'detail',
    image: '/images/medicine.webp',
    title: 'The details of care',
    description: 'Generated packaging concept. Product information is pending.',
    category: 'Product concept',
    order: 2,
  },
  {
    id: 'essentials',
    image: '/images/wellness.webp',
    title: 'Everyday essentials',
    description: 'Generated sample image. Not a verified product.',
    category: 'Product concept',
    order: 3,
  },
];
