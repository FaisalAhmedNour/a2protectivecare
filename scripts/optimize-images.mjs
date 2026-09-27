import sharp from 'sharp';
import fs from 'node:fs/promises';
const widths = [96, 160, 240, 320, 480, 768, 1024, 1440, 1920];
await fs.mkdir('public/images', { recursive: true });
const assets = [
  { name: 'hero', src: 'assets/medicine-concept.png' },
  { name: 'story', src: 'assets/pharmacy-concept.png' },
  {
    name: 'medicine',
    src: 'assets/medicine-concept.png',
    extract: { left: 890, top: 430, width: 440, height: 530 },
  },
  {
    name: 'wellness',
    src: 'assets/medicine-concept.png',
    extract: { left: 600, top: 240, width: 400, height: 560 },
  },
  {
    name: 'first-aid',
    src: 'assets/medicine-concept.png',
    extract: { left: 260, top: 150, width: 400, height: 640 },
  },
  {
    name: 'essentials',
    src: 'assets/pharmacy-concept.png',
    extract: { left: 760, top: 550, width: 500, height: 440 },
  },
];
for (const asset of assets) {
  let source = sharp(asset.src);
  if (asset.extract) source = source.extract(asset.extract);
  const buffer = await source.toBuffer();
  await sharp(buffer).webp({ quality: 85 }).toFile(`public/images/${asset.name}.webp`);
  await Promise.all(
    widths.map((width) =>
      sharp(buffer)
        .resize(width)
        .webp({ quality: 82 })
        .toFile(`public/images/${asset.name}-${width}.webp`),
    ),
  );
}
console.log('Optimized 6 image compositions in 9 responsive sizes.');
