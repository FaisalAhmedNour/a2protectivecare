'use client';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { Product } from '@/types/catalog';
import { AddToOrder } from './order-provider';
import { WhatsAppAction } from './whatsapp-action';
import { Media } from './ui/media';
export function ProductGallery({ product }: { product: Product }) {
  const images = product.images && product.images.length > 0 ? product.images : ['/images/medicine.webp'];
  const [selected, setSelected] = useState(0);
  const activeIndex = selected < images.length ? selected : 0;

  return (
    <div>
      <div className="product-main-image">
        <Media
          key={activeIndex}
          src={images[activeIndex]}
          alt={`${product.name} — image ${activeIndex + 1}`}
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="thumbnails">
          {images.map((image, i) => (
            <button
              key={image + i}
              aria-label={`View image ${i + 1}`}
              aria-pressed={activeIndex === i}
              onClick={() => setSelected(i)}
            >
              <Media src={image} alt={`${product.name} thumbnail ${i + 1}`} sizes="96px" />
            </button>
          ))}
        </div>
      )}
      <p className="small muted" style={{ marginTop: 14 }}>
        Concept imagery. Actual product appearance may differ.
      </p>
    </div>
  );
}
export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <>
      <span className="quantity-label" id="quantity-label">
        Quantity
      </span>
      <div className="quantity" role="group" aria-labelledby="quantity-label">
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          onClick={() => setQuantity((q) => q - 1)}
        >
          <Minus size={17} />
        </button>
        <span aria-live="polite">{quantity}</span>
        <button
          aria-label="Increase quantity"
          disabled={quantity >= 99}
          onClick={() => setQuantity((q) => q + 1)}
        >
          <Plus size={17} />
        </button>
      </div>
      <div className="product-actions">
        <AddToOrder
          productId={product.id}
          quantity={quantity}
          disabled={product.inStock === false}
        />
        {product.inStock !== false && (
          <WhatsAppAction className="button button-outline" items={[{ product, quantity }]}>
            Order on WhatsApp
          </WhatsAppAction>
        )}
      </div>
      <p className="inquiry-note muted">
        No payment is taken here. Confirm product details and any prescription requirements before
        placing an order.
      </p>
    </>
  );
}
