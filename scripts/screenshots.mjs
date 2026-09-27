import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('qa/screenshots', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const origin = process.env.TEST_BASE_URL || 'http://localhost:3000';
for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
]) {
  await page.setViewportSize({ width, height });
  for (const [route, label] of [
    ['/', 'home'],
    ['/products/', 'products'],
    ['/products/tablet-format/', 'detail'],
    ['/categories/', 'categories'],
    ['/about/', 'about'],
    ['/team/', 'team'],
    ['/gallery/', 'gallery'],
    ['/contact/', 'contact'],
  ]) {
    await page.goto(origin + route);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('img').evaluateAll(async (images) =>
      Promise.all(
        images.map((image) => {
          image.loading = 'eager';
          return image.decode().catch(() => {});
        }),
      ),
    );
    await page.screenshot({
      path: `qa/screenshots/${name}-${label}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  }
  console.log(`Captured ${name} pages.`);
}
await browser.close();
