// Next.js currently emits nested segment files on Windows, while its router
// requests dot-separated filenames. Add portable aliases to the static export.
// Upstream: https://github.com/vercel/next.js/issues/92339
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('out');
async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}
let count = 0;
for (const source of await walk(root)) {
  const parts = path.relative(root, source).split(path.sep);
  const index = parts.findIndex((part) => part.startsWith('__next.'));
  if (index < 0 || index === parts.length - 1 || !source.endsWith('.txt')) continue;
  const destination = path.join(root, ...parts.slice(0, index), parts.slice(index).join('.'));
  const sourceBytes = await fs.readFile(source);
  try {
    const existing = await fs.readFile(destination);
    if (!existing.equals(sourceBytes)) throw Error(`Conflicting segment payload: ${destination}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.writeFile(destination, sourceBytes);
    count++;
  }
}
console.log(`Static export ready: ${count} Windows segment aliases added.`);
