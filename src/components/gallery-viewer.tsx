'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { gallery } from '@/data/gallery';
import { Media } from './ui/media';
import { Dialog } from './ui/dialog';
export function GalleryViewer() {
  const [active, setActive] = useState<number | null>(null);
  const move = (delta: number) =>
    setActive((i) => (i === null ? null : (i + delta + gallery.length) % gallery.length));
  useEffect(() => {
    if (active === null) return;
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActive((i) => (i === null ? null : (i + 1) % gallery.length));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActive((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length));
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [active]);
  const item = active === null ? null : gallery[active];
  return (
    <>
      <div className="gallery-grid">
        {gallery.map((g, i) => (
          <button
            className="gallery-item"
            key={g.id}
            onClick={() => setActive(i)}
            aria-label={`Open ${g.title}`}
          >
            <Media src={g.image} alt={g.description} />
            <span>{g.category}</span>
            <h2>{g.title}</h2>
          </button>
        ))}
      </div>
      <Dialog
        open={active !== null}
        onClose={() => setActive(null)}
        title={item?.title ?? 'Gallery'}
        wide
      >
        {item && (
          <>
            <Media
              key={item.id}
              className="lightbox-image"
              src={item.image}
              alt={item.description}
              sizes="90vw"
            />
            <div className="lightbox-bottom">
              <p>{item.description}</p>
              <div className="lightbox-controls">
                <button
                  className="icon-button"
                  aria-label="Previous image"
                  onClick={() => move(-1)}
                >
                  <ArrowLeft />
                </button>
                <span aria-live="polite">
                  {(active ?? 0) + 1} / {gallery.length}
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
