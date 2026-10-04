import type { Metadata } from 'next';
import { site } from '@/data/site';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OrderProvider } from '@/components/order-provider';
import './globals.css';
import '@fontsource-variable/manrope';
import { WebMCP } from '@/components/webmcp';
import { WhatsAppAction } from '@/components/whatsapp-action';
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  icons: { icon: '/icon.svg' },
  robots: site.sampleMode ? { index: false, follow: false } : { index: true, follow: true },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: `(()=>{try{const m=localStorage.getItem('a2-theme')||'system';document.documentElement.dataset.theme=m}catch{}})()` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: site.name,
              url: site.url,
            }).replace(/</g, '\\u003c'),
          }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <OrderProvider>
          <WebMCP />
          <Header />
          {/* <div className="global-theme-control"><ThemeToggle /></div> */}
          <main id="main">{children}</main>
          <Footer />
          <div className="whatsapp-dock">
            <WhatsAppAction
              className="floating-whatsapp"
              ariaLabel="Order on WhatsApp — chat with us"
            >
              <span className="floating-label">Chat with us</span>
              <span className="mobile-floating-label">Order on WhatsApp</span>
            </WhatsAppAction>
          </div>
        </OrderProvider>
      </body>
    </html>
  );
}
