import { test, expect } from '@playwright/test';
test('placeholder categories are explicit and product specifications are optional', async ({
  page,
}) => {
  await page.goto('/categories/');
  for (const name of ['Category One', 'Category Two', 'Category Three', 'Category Four'])
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.goto('/products/oral-liquid-format/');
  await expect(page.getByRole('heading', { name: 'Product information', exact: true })).toHaveCount(
    0,
  );
  await page.goto('/products/tablet-format/');
  await expect(
    page.getByRole('heading', { name: 'Product information', exact: true }),
  ).toBeVisible();
});
test('contact accepts an inquiry without optional email or subject', async ({ page }) => {
  await page.goto('/contact/');
  await page.getByLabel('Your name').fill('Test Person');
  await page.getByLabel('Phone number').fill('+8801700000000');
  await page.getByLabel('Your message').fill('Please help me with a product inquiry.');
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Your message has not been sent' }),
  ).toBeVisible();
});
test('global WhatsApp control works on mobile and preserves focus', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/products/');
  const action = page.getByRole('button', {
    name: 'Order on WhatsApp — chat with us',
    exact: true,
  });
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  await action.click();
  await expect(page.getByRole('dialog', { name: 'WhatsApp contact coming soon' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(action).toBeFocused();
});
