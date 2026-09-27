'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { products } from '@/data/products';
import { sanitizeOrder } from '@/lib/order';
import {
  getOrderSnapshot,
  getServerOrderSnapshot,
  setOrder,
  subscribeOrder,
} from '@/lib/order-store';
import type { OrderLine } from '@/types/catalog';
import { Dialog } from './ui/dialog';
import { Media } from './ui/media';
import { WhatsAppAction } from './whatsapp-action';
type OrderContextType = {
  lines: OrderLine[];
  add: (id: string, quantity?: number) => void;
  show: () => void;
};
const OrderContext = createContext<OrderContextType | null>(null);
export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw Error('Order provider missing');
  return ctx;
}
export function OrderProvider({ children }: { children: ReactNode }) {
  const { lines, storageError } = useSyncExternalStore(
    subscribeOrder,
    getOrderSnapshot,
    getServerOrderSnapshot,
  );
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  const add = useCallback((id: string, quantity = 1) => {
    const product = products.find((p) => p.id === id);
    if (
      !product ||
      product.inStock === false ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    )
      return;
    setOrder((current) => sanitizeOrder([...current, { productId: id, quantity }]));
    setNotice(`${product.name} added to your order`);
  }, []);
  const update = (id: string, quantity: number) =>
    setOrder((current) =>
      quantity < 1
        ? current.filter((l) => l.productId !== id)
        : sanitizeOrder(current.map((l) => (l.productId === id ? { ...l, quantity } : l))),
    );
  const items = lines.flatMap((l) => {
    const product = products.find((p) => p.id === l.productId);
    return product ? [{ product, quantity: l.quantity }] : [];
  });
  return (
    <OrderContext.Provider value={{ lines, add, show: () => setOpen(true) }}>
      {children}
      <div aria-live="polite" className={`toast ${notice ? 'visible' : ''}`}>
        {notice}
        <button onClick={() => setOpen(true)}>View order</button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Your order list">
        {!items.length ? (
          <div className="empty-state">
            <ShoppingBag size={40} />
            <h3>A little room for your essentials.</h3>
            <p>Add products as you browse. Send them together in one WhatsApp inquiry.</p>
            <button className="button button-primary" onClick={() => setOpen(false)}>
              Continue browsing
            </button>
          </div>
        ) : (
          <>
            <p className="small muted">
              An inquiry, not a checkout. Price and availability are confirmed separately.
            </p>
            <ul className="order-list">
              {items.map(({ product, quantity }) => (
                <li key={product.id}>
                  <Media src={product.images[0]} alt={`${product.name} concept`} sizes="96px" />
                  <div>
                    <h3>{product.name}</h3>
                    <span className="small muted">
                      {product.sample ? 'Sample product' : 'Availability on inquiry'}
                    </span>
                    <div className="quantity small-quantity">
                      <button
                        aria-label={`Decrease ${product.name}`}
                        onClick={() => update(product.id, quantity - 1)}
                      >
                        <Minus size={15} />
                      </button>
                      <span>{quantity}</span>
                      <button
                        disabled={quantity >= 99}
                        aria-label={`Increase ${product.name}`}
                        onClick={() => update(product.id, quantity + 1)}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => update(product.id, 0)}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="order-summary">
              <span>{items.reduce((n, l) => n + l.quantity, 0)} items</span>
              <strong>Total confirmed on inquiry</strong>
            </div>
            <WhatsAppAction items={items}>Order on WhatsApp</WhatsAppAction>
            <button className="text-button clear-order" onClick={() => setOrder([])}>
              Clear order
            </button>
          </>
        )}
        {storageError && (
          <p role="status">
            Your browser could not save this order. It will last only for this visit.
          </p>
        )}
      </Dialog>
    </OrderContext.Provider>
  );
}
export function AddToOrder({
  productId,
  quantity = 1,
  compact = false,
  disabled = false,
}: {
  productId: string;
  quantity?: number;
  compact?: boolean;
  disabled?: boolean;
}) {
  const { add } = useOrder();
  return (
    <button
      disabled={disabled}
      className={compact ? 'add-button' : 'button button-primary'}
      onClick={() => add(productId, quantity)}
      aria-label={
        compact ? `Add ${products.find((p) => p.id === productId)?.name} to order` : undefined
      }
    >
      <Plus size={18} />
      {!compact && 'Add to order'}
    </button>
  );
}
