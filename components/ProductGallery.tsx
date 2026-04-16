'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || null);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', transformOrigin: 'center' });
  const [isImgError, setIsImgError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 font-serif italic border-2 border-dashed border-gray-100">
        Hiện chưa có hình ảnh cho sản phẩm này
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      transformOrigin: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', transformOrigin: 'center' });
  };

  const placeholderImg = "/no-image.jpg";

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000">
      {/* High-Performance Main Viewer */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white border border-gray-100 relative cursor-zoom-in group"
      >
        <Image 
          src={isImgError ? placeholderImg : (activeImage?.image_path || placeholderImg)} 
          alt={productName} 
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-500"
          onError={() => setIsImgError(true)}
          placeholder="blur"
          blurDataURL={placeholderImg}
        />
        
        {/* Zoomed Overlay */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none hidden lg:block"
          style={{
            ...zoomStyle,
            backgroundImage: `url(${isImgError ? placeholderImg : activeImage?.image_path})`,
            backgroundSize: '250%',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'white'
          }}
        />

        {/* Sophisticated Badge */}
        {activeImage?.is_primary && (
             <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md text-[#800020] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm z-20">
                Signature Collection
             </div>
        )}
      </div>

      {/* Thumbnails Navigation */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => {
                  setActiveImage(img);
                  setIsImgError(false);
              }}
              onMouseEnter={() => {
                  setActiveImage(img);
                  setIsImgError(false);
              }}
              className={`relative flex-shrink-0 w-24 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-500 transform
                ${activeImage?.id === img.id 
                    ? 'border-[#800020] ring-8 ring-[#800020]/5 translate-y-[-4px]' 
                    : 'border-transparent grayscale hover:grayscale-0 hover:translate-y-[-2px]'}
              `}
            >
              <Image 
                src={img.image_path} 
                alt={`${productName} variant`} 
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #80002020;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #80002040;
        }
      `}</style>
    </div>
  );
}
