import { products } from '@/data/products';
import type { OrderLine } from '@/types/catalog';
export const ORDER_KEY = 'a2-order-v1';
export function sanitizeOrder(input: unknown): OrderLine[] {
  if (!Array.isArray(input)) return [];
  const result = new Map<string, number>();
  for (const item of input) {
    if (
      typeof item !== 'object' ||
      !item ||
      typeof item.productId !== 'string' ||
      !products.some((p) => p.id === item.productId) ||
      typeof item.quantity !== 'number' ||
      !Number.isFinite(item.quantity) ||
      item.quantity < 1
    )
      continue;
    result.set(
      item.productId,
      Math.min(99, (result.get(item.productId) ?? 0) + Math.floor(item.quantity)),
    );
  }
  return [...result].map(([productId, quantity]) => ({ productId, quantity }));
}
