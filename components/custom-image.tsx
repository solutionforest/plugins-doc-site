'use client';

import { useState } from 'react';
// import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import Image from 'next/image';

export function CustomImage(props: any) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  // Check if the image is an SVG (which requires unoptimized prop)
  const isSvg = props.src?.endsWith('.svg') || props.src?.includes('img.shields.io');

  // Simple fallback for now to debug panic
  return (
      <Image
        {...props}
        onError={() => setHasError(true)}
        width={props.width || 700}
        height={props.height || 300}
        style={{ maxWidth: '100%', height: 'auto' }}
        unoptimized={isSvg}
      />
  );
}
