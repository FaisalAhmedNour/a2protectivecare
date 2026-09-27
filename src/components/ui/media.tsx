'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';
export function Media({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 640px) 100vw, 50vw',
  className = '',
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`media ${className}`}>
      {failed ? (
        <div className="image-fallback">
          <ImageOff aria-hidden="true" />
          <span>Image unavailable</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
