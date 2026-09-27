import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes = [
  '/',
  '/products/',
  '/products/tablet-format/',
  '/categories/',
  '/categories/category-one/',
  '/about/',
  '/team/',
  '/gallery/',
  '/contact/',
  '/privacy/',
  '/terms/',
];
test('all pages render, images load, metadata exists, no console errors or broken local links', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const links = new Set<string>();
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(route.replaceAll('/', '\\/')),
    );
    await page.locator('img').evaluateAll(async (images: HTMLImageElement[]) =>
      Promise.all(
        images.map((image) => {
          image.loading = 'eager';
          return image.decode().catch(() => {});
        }),
      ),
    );
    expect(
      await page
        .locator('img')
        .evaluateAll((images: HTMLImageElement[]) =>
          images.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
        ),
    ).toEqual([]);
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((a) => a.map((x) => x.getAttribute('href')!)))
      links.add(href);
  }
  for (const link of links) {
    const r = await request.get(link);
    expect(r.status(), link).toBe(200);
  }
  expect(errors).toEqual([]);
});
test('catalog search, category filter, sorting, empty state and load more', async ({ page }) => {
  await page.goto('/products/');
  await expect(page.locator('.product-card')).toHaveCount(8);
  await page.getByRole('button', { name: /Load more/ }).click();
  await expect(page.locator('.product-card')).toHaveCount(9);
  await page.getByLabel('Search the catalog').fill('tablet');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByLabel('Search the catalog').fill('unknown product');
  await expect(page.getByRole('heading', { name: 'No products found.' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).first().click();
  await page.getByLabel('Category', { exact: true }).selectOption('category-three');
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.getByLabel('Sort by').selectOption('name');
  await expect(page.locator('.product-card h2').first()).toHaveText('Dressing format');
});
test('order list: quantities, persistence, multi-product inquiry, remove and clear', async ({
  page,
}) => {
  await page.goto('/products/tablet-format/');
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await page.getByRole('button', { name: 'Add to order', exact: true }).click();
  await page.goto('/products/oral-liquid-format/');
  await page.getByRole('button', { name: 'Add to order', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Open order list, 3 items' }).click();
  const bag = page.getByRole('dialog', { name: 'Your order list' });
  await expect(bag.getByText('Tablet format', { exact: true })).toBeVisible();
  await expect(bag.getByText('Oral liquid format', { exact: true })).toBeVisible();
  await bag.getByRole('button', { name: 'Increase Tablet format' }).click();
  await bag.getByRole('button', { name: 'Decrease Tablet format' }).click();
  await bag.getByRole('button', { name: 'Order on WhatsApp' }).click();
  const inquiry = page.getByRole('dialog', { name: 'WhatsApp contact coming soon' });
  await expect(inquiry.getByLabel('Prepared inquiry')).toHaveValue(/Quantity: 2/);
  await expect(inquiry.getByLabel('Prepared inquiry')).toHaveValue(/2\. Oral liquid format/);
  await page.keyboard.press('Escape');
  await bag.getByRole('button', { name: 'Remove Oral liquid format' }).click();
  await expect(bag.getByText('Oral liquid format', { exact: true })).toHaveCount(0);
  await bag.getByRole('button', { name: 'Clear order' }).click();
  await expect(
    bag.getByRole('heading', { name: 'A little room for your essentials.' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open order list, 0 items' })).toBeFocused();
});
test('invalid persisted data cannot break order UI', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('a2-order-v1', '{"malformed": true}'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open order list, 0 items' }).click();
  await expect(page.getByText('A little room for your essentials.')).toBeVisible();
});
test('gallery keyboard navigation, focus trap and restoration', async ({ page }) => {
  await page.goto('/gallery/');
  const trigger = page.getByRole('button', { name: 'Open A considered collection' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-label', 'Space for better care');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-label', 'A considered collection');
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
test('contact uses native validation and honest unconfigured service state', async ({ page }) => {
  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await expect(page.getByLabel('Your name')).toBeFocused();
  await page.getByLabel('Your name').fill('Test Person');
  await page.getByLabel('Phone number').fill('+8801700000000');
  await page.getByLabel('Email address').fill('test@example.com');
  await page.getByLabel('Subject (optional)', { exact: true }).fill('Product inquiry');
  await page.getByLabel('Your message').fill('Please confirm product availability.');
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Your message has not been sent' }),
  ).toBeVisible();
  await expect(page.getByLabel('Your name')).toHaveValue('Test Person');
});
test('mobile menu closes on navigation and Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open navigation menu' });
  await toggle.click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'Products' })
    .click();
  await expect(page).toHaveURL(/\/products\//);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('product thumbnails and single inquiry quantity', async ({ page }) => {
  await page.goto('/products/tablet-format/');
  await page.getByRole('button', { name: 'View image 2', exact: true }).click();
  await expect(page.getByRole('button', { name: 'View image 2', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await page.locator('.product-actions').getByRole('button', { name: 'Order on WhatsApp' }).click();
  await expect(page.getByLabel('Prepared inquiry')).toHaveValue(/Quantity: 2/);
});
for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920])
  test(`responsive layouts have no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes.slice(0, 9)) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(dimensions.scroll, `${route} at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
    }
  });
test('accessibility scan on major page types and modal', async ({ page }) => {
  for (const route of [
    '/',
    '/products/',
    '/products/tablet-format/',
    '/categories/',
    '/about/',
    '/team/',
    '/gallery/',
    '/contact/',
  ]) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations, `${route}: ${result.violations.map((v) => v.id).join(',')}`).toEqual(
      [],
    );
  }
  await page.goto('/gallery/');
  await page.getByRole('button', { name: 'Open A considered collection' }).click();
  const modal = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(modal.violations).toEqual([]);
});
test('404 and SEO endpoints', async ({ page, request }) => {
  const response = await page.goto('/does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /This page isn’t/ })).toBeVisible();
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /');
});
