import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      ...(site.sampleMode ? { disallow: '/' } : { allow: '/', disallow: '/admin/' }),
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
