'use client';

import React, { useEffect, useState } from 'react';
import { useRepository } from '@comic-catalog/ui';

interface CoverImageProps {
  imageId: string | null;
  alt: string;
  className?: string;
}

export function CoverImage({ imageId, alt, className = '' }: CoverImageProps) {
  const repo = useRepository();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      const image = await repo.getImage(imageId);
      if (image && !cancelled) {
        const result = await repo.getImageUrl(image);
        if (!cancelled && result) {
          objectUrl = result;
          setUrl(result);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageId, repo]);

  if (!url) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 ${className}`}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
