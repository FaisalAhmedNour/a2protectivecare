'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { gallery as seedGallery } from '@/data/gallery';
import type { GalleryItem } from '@/types/catalog';
import { Media } from './ui/media';
import { Dialog } from './ui/dialog';

function GalleryMedia({ item, className = '' }: { item: GalleryItem; className?: string }) {
  if (item.mediaType === 'video') {
    return (
      <video
        className={`gallery-video ${className}`}
        controls
        preload="metadata"
        src={item.mediaUrl || item.mediaBlob || ''}
        aria-label={item.title}
      />
    );
  }
  return (
    <Media
      className={className}
      src={item.mediaUrl || item.image || item.mediaBlob || '/images/hero.webp'}
      alt={item.description || item.title}
    />
  );
}

export function GalleryViewer({ gallery = seedGallery }: { gallery?: GalleryItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [active, setActive] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    gallery.forEach((g) => {
      if (g.category && g.category.trim()) set.add(g.category.trim());
    });
    return ['All', ...Array.from(set)];
  }, [gallery]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return gallery;
    return gallery.filter((g) => g.category?.trim() === selectedCategory);
  }, [gallery, selectedCategory]);

  const move = (delta: number) =>
    setActive((i) => (i === null ? null : (i + delta + filtered.length) % filtered.length));

  useEffect(() => {
    if (active === null) return;
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActive((i) => (i === null ? null : (i + 1) % filtered.length));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActive((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [active, filtered.length]);

  const item = active === null ? null : filtered[active];

  return (
    <>
      {categories.length > 2 && (
        <div
          className="admin-presets"
          style={{ justifyContent: 'center', marginBottom: 28, gap: 8 }}
          role="tablist"
          aria-label="Filter gallery by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`button ${selectedCategory === cat ? 'button-primary' : 'button-outline'}`}
              style={{
                borderRadius: 99,
                padding: '6px 16px',
                fontSize: '0.85rem',
                transition: 'all 0.15s ease',
              }}
              onClick={() => {
                setSelectedCategory(cat);
                setActive(null);
              }}
              role="tab"
              aria-selected={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="gallery-grid">
          {filtered.map((g, i) => (
            <button
              className="gallery-item"
              key={g.id || i}
              onClick={() => setActive(i)}
              aria-label={`Open ${g.title}`}
            >
              <GalleryMedia item={g} />
              <span>{g.category || 'Visual Showcase'}</span>
              <h2>{g.title}</h2>
            </button>
          ))}
        </div>
      ) : (
        <div className="admin-empty" style={{ margin: '40px 0' }}>
          No gallery media entries found for &quot;{selectedCategory}&quot;.
        </div>
      )}

      <Dialog
        open={active !== null}
        onClose={() => setActive(null)}
        title={item?.title ?? 'Gallery'}
        wide
      >
        {item && (
          <>
            <GalleryMedia
              item={item}
              key={item.id || active}
              className="lightbox-image"
            />
            <div className="lightbox-bottom">
              <div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {item.category || 'Visual Showcase'}
                </span>
                <p style={{ margin: 0 }}>{item.description || item.title}</p>
              </div>
              <div className="lightbox-controls">
                <button
                  className="icon-button"
                  aria-label="Previous image"
                  onClick={() => move(-1)}
                >
                  <ArrowLeft />
                </button>
                <span aria-live="polite">
                  {(active ?? 0) + 1} / {filtered.length}
                </span>
                <button className="icon-button" aria-label="Next image" onClick={() => move(1)}>
                  <ArrowRight />
                </button>
              </div>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
