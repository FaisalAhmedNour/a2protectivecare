import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:3000');
await page.addStyleTag({ content: 'html {font-size:200%}' });
console.log(
  await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > window.innerWidth + 1 && r.width > 0;
      })
      .map((el) => ({
        tag: el.tagName,
        cls: el.className,
        text: el.textContent?.slice(0, 45),
        width: el.getBoundingClientRect().width,
        right: el.getBoundingClientRect().right,
      }))
      .slice(0, 30),
  ),
);
await page.screenshot({ path: 'qa/screenshots/enlarged-mobile.png' });
await browser.close();
