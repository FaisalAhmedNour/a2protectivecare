export function formatPrice(value?: number) {
  return value === undefined
    ? 'Price on inquiry'
    : `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value)}`;
}
