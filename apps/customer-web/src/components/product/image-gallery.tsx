'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  if (images.length === 0) {
    return (
      <div className="w-full aspect-square rounded-xl bg-mono-3 flex items-center justify-center">
        <span className="text-mono-9">No image available</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-mono-2">
        <Image
          src={images[selectedIndex]}
          alt={alt}
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`
                relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0
                transition-all
                ${selectedIndex === index 
                  ? 'ring-2 ring-mono-12' 
                  : 'ring-1 ring-mono-6 hover:ring-mono-8'
                }
              `}
            >
              <Image
                src={image}
                alt={`${alt} - ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
