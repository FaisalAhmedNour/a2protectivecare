import { test, expect } from '@playwright/test';
test('image failure has a readable fallback', async ({ page }) => {
  await page.route('**/images/hero-*.webp', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('.hero-visual').getByText('Image unavailable')).toBeVisible();
});
test('blocked storage preserves current order and explains persistence limit', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage blocked', 'SecurityError');
    };
  });
  await page.goto('/products/tablet-format/');
  await page.getByRole('button', { name: 'Add to order', exact: true }).click();
  await page.getByRole('button', { name: 'Open order list, 1 items' }).click();
  await expect(page.getByText('Your browser could not save this order.')).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Tablet format' }),
  ).toBeVisible();
});
test('two tabs synchronize an order list', async ({ page, context }) => {
  await page.goto('/products/');
  const other = await context.newPage();
  await other.goto('/products/');
  await page.getByRole('button', { name: 'Add Tablet format to order', exact: true }).click();
  await expect(other.getByRole('button', { name: 'Open order list, 1 items' })).toBeVisible();
  await other.close();
});
test('200 percent text remains navigable on small viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
});
