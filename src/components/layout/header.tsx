'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { navigation } from '@/data/site';
import { content } from '@/data/content';
import { useOrder } from '../order-provider';
import { WhatsAppAction } from '../whatsapp-action';
import { Dialog } from '../ui/dialog';
export function Logo() {
  return (
    <Link href="/" className="brand" aria-label="A2 Protective Care home">
      <span className="brand-mark">
        a<span>2</span>
        <i />
      </span>
      <span className="brand-name">
        PROTECTIVE
        <br />
        CARE
      </span>
    </Link>
  );
}
export function Header() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const { lines, show } = useOrder();
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  return (
    <>
      <div className="announcement">
        <span>{content.announcement}</span>
        <Link href="/products/">
          Explore the sample catalog <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={
                  (n.href === '/' ? path === '/' : path.startsWith(n.href.slice(0, -1)))
                    ? 'page'
                    : undefined
                }
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <WhatsAppAction className="button button-primary header-whatsapp" />
            <button
              className="icon-button bag-button"
              onClick={show}
              aria-label={`Open order list, ${count} items`}
            >
              <ShoppingBag size={21} />
              {count > 0 && <span>{count}</span>}
            </button>
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation menu"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>
      <Dialog open={menu} onClose={() => setMenu(false)} title="Explore A2">
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigation.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMenu(false)}>
              {n.label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      </Dialog>
    </>
  );
}
