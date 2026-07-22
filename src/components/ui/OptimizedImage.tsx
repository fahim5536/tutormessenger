import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils'; // assuming cn utility exists from shadcn

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // If priority is true, we fetch eagerly and sync
  const loading = priority ? 'eager' : 'lazy';
  const fetchPriority = priority ? 'high' : 'auto';
  const decoding = priority ? 'sync' : 'async';

  useEffect(() => {
    if (priority) {
      // Preload critical images dynamically if not already in HTML
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    if (props.onError) {
      props.onError(e);
    }
  };

  const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E`;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-100',
        className
      )}
    >
      {placeholder === 'blur' && blurDataURL && !isLoaded && !error && (
        <img
          src={blurDataURL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-lg transform scale-110"
        />
      )}
      
      <img
        src={error ? fallbackSvg : src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={decoding}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          {
            'object-cover': objectFit === 'cover',
            'object-contain': objectFit === 'contain',
            'object-fill': objectFit === 'fill',
            'object-none': objectFit === 'none',
            'object-scale-down': objectFit === 'scale-down',
          },
          !isLoaded && placeholder === 'blur' ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
