'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';

interface RollingGalleryProps {
  items: Array<{
    image: string;
    text: string;
  }>;
  direction?: 'left' | 'right';
  speed?: number;
}

export default function RollingGallery({ 
  items, 
  direction = 'left', 
  speed = 30 
}: RollingGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollerRef.current || !contentRef.current) return;

    // Clone the content for seamless scrolling
    const content = contentRef.current;
    scrollerRef.current.appendChild(content.cloneNode(true));

    const scrollSpeed = direction === 'left' ? -speed : speed;
    let animationFrameId: number;
    let currentTranslate = 0;

    const animate = () => {
      if (!scrollerRef.current || !contentRef.current) return;
      
      currentTranslate += scrollSpeed / 60; // Smooth movement
      
      // Reset position when a full scroll is complete
      const contentWidth = contentRef.current.offsetWidth;
      if (Math.abs(currentTranslate) >= contentWidth) {
        currentTranslate = 0;
      }

      scrollerRef.current.style.transform = `translateX(${currentTranslate}px)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [direction, speed]);

  return (
    <div className="relative overflow-hidden w-full bg-accent/5">
      <div 
        ref={scrollerRef}
        className="flex whitespace-nowrap py-6"
        style={{ willChange: 'transform' }}
      >
        <div ref={contentRef} className="flex gap-4 px-2">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="relative flex-none w-[300px] h-[200px] rounded-lg overflow-hidden group"
            >
              <Image
                src={item.image}
                alt={item.text}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-medium truncate">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
