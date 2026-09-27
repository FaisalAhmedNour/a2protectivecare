import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '',
    'about/',
    'categories/',
    'products/',
    'team/',
    'gallery/',
    'contact/',
    'privacy/',
    'terms/',
    ...products.map((p) => `products/${p.slug}/`),
    ...categories.map((c) => `categories/${c.slug}/`),
  ].map((path) => ({ url: `${site.url}/${path}` }));
}
