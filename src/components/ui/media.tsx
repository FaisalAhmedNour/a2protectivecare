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
  const isValid = Boolean(src && typeof src === 'string' && src.trim().length > 0);
  const isUnoptimized = Boolean(isValid && (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http://') || src.startsWith('https://')));

  return (
    <div className={`media ${className}`}>
      {!isValid || failed ? (
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
          unoptimized={isUnoptimized}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
