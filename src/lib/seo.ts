import type { Metadata } from 'next';
import { site } from '@/data/site';
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, site.url).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      type: 'website',
      siteName: site.name,
    },
    twitter: { card: 'summary', title: `${title} | ${site.name}`, description },
  };
}
