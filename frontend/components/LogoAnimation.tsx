'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LogoAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Walking Pencil Logo Animation
 * Used for branding across the application
 */
export default function LogoAnimation({ size = 'md', className = '' }: LogoAnimationProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/WalkingPencil.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {animationData ? (
        <Lottie 
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        // Fallback: Simple pencil emoji
        <div className="w-full h-full flex items-center justify-center text-4xl">
          ✏️
        </div>
      )}
    </div>
  );
}

