'use client';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { products } from '@/data/products';
import { getOrderSnapshot, setOrder } from '@/lib/order-store';
interface Tool {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
}
type ModelDocument = Document & {
  modelContext?: {
    registerTool: (tool: Tool, options: { signal: AbortSignal }) => void | Promise<void>;
  };
};
export function WebMCP() {
  useEffect(() => {
    const context = (document as ModelDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools: Tool[] = [
      {
        name: 'read_order_list',
        title: 'Read order list',
        description:
          'Read product IDs and quantities in the local inquiry bag. No order has been submitted.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: () => ({ items: getOrderSnapshot().lines }),
      },
      {
        name: 'stage_order_items',
        title: 'Add products to inquiry bag',
        description:
          'Add sample catalog products to the local inquiry bag. Does not send an inquiry, place an order, or take payment.',
        inputSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              maxItems: 50,
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1, maximum: 99 },
                },
                required: ['productId', 'quantity'],
                additionalProperties: false,
              },
            },
          },
          required: ['items'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: (input: unknown) => {
          if (
            typeof input !== 'object' ||
            !input ||
            !('items' in input) ||
            !Array.isArray(input.items) ||
            !input.items.length ||
            input.items.length > 50
          )
            throw Error('Expected 1–50 items.');
          const items = input.items.map((item: unknown) => {
            if (
              typeof item !== 'object' ||
              !item ||
              !('productId' in item) ||
              typeof item.productId !== 'string' ||
              !('quantity' in item) ||
              typeof item.quantity !== 'number' ||
              !Number.isInteger(item.quantity) ||
              item.quantity < 1 ||
              item.quantity > 99 ||
              !products.some((p) => p.id === item.productId && p.inStock !== false)
            )
              throw Error('Unknown product or invalid quantity.');
            return { productId: item.productId, quantity: item.quantity };
          });
          flushSync(() => setOrder((current) => [...current, ...items]));
          return { status: 'staged', items: getOrderSnapshot().lines };
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(
          () => {},
        );
      } catch {
        /* Optional browser capability; visible controls remain available. */
      }
    }
    return () => lifecycle.abort();
  }, []);
  return null;
}
