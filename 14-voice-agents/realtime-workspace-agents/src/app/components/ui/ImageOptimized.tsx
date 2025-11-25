// ImageOptimized.tsx - Next/Image wrapper with smooth loading
'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ImageOptimizedProps extends ImageProps {
  className?: string;
}

export function ImageOptimized({ className, ...props }: ImageOptimizedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <motion.div 
          className="absolute inset-0 bg-white/5 animate-pulse"
          exit={{ opacity: 0 }}
        />
      )}
      
      <Image
        {...props}
        alt={props.alt || ''}
        className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

