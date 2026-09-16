'use client';

import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface DishImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIconSize?: number;
}

export default function DishImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackIconSize = 24,
}: DishImageProps) {
  const [hasError, setHasError] = useState(false);

  // If no src or failed to load
  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500">
        <Utensils size={fallbackIconSize} />
      </div>
    );
  }

  // If it's an emoji (single character or non-url)
  if (!src.startsWith('/') && !src.startsWith('http')) {
    return (
      <div className="w-full h-full flex items-center justify-center text-3xl">
        {src}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
