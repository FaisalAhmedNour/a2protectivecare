import { test, expect } from '@playwright/test';

test('admin sign-in protects the workspace and exposes content controls', async ({ page }) => {
  await page.goto('/admin/');
  await expect(page).toHaveURL(/\/admin\/login\/?$/);
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('change-this-before-running-in-production');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole('heading', { name: 'Content control room' })).toBeVisible();
  await page.getByRole('button', { name: 'Add new' }).click();
  await page.getByLabel('Name').first().fill('Admin sample product');
  await page.getByLabel('Price (BDT)', { exact: true }).fill('950');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Admin sample product')).toBeVisible();
  await page.getByRole('button', { name: 'Gallery' }).click();
  await page.getByRole('button', { name: 'Add new' }).click();
  await page.getByLabel('Title').fill('Field video');
  await page.getByLabel('Media type').selectOption('video');
  await page.getByLabel('Media URL').fill('https://example.com/field.mp4');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Field video')).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login\/?$/);
});

test('theme control cycles and inquiry form saves customer data before handoff', async ({ page }) => {
  await page.goto('/products/');
  await expect(page.getByText(/280/)).toBeVisible();
  await page.getByRole('button', { name: /Theme mode/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: /Theme mode/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: /Add Tablet format to order/ }).first().click();
  await page.getByRole('button', { name: /Open order list/ }).first().click();
  await page.getByRole('button', { name: 'Continue to WhatsApp' }).click();
  await page.getByLabel('Your name').fill('Field buyer');
  await page.getByLabel('Phone number').fill('+8801700000000');
  await page.getByLabel('Delivery address').fill('Farm road, Dhaka');
  await page.getByRole('button', { name: /Save and open WhatsApp/ }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});
