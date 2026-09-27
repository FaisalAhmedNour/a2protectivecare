'use client';
export default function imageLoader({ src, width }: { src: string; width: number }) {
  return src.replace(/\.webp$/, `-${width}.webp`);
}
