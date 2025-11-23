'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

/**
 * Small inline loading spinner with walking pencil animation
 * Perfect for buttons and inline loading states
 */
export default function LoadingSpinner({ size = 'sm', className = '' }: LoadingSpinnerProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/WalkingPencil.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <div className={`${sizeClasses[size]} inline-flex items-center justify-center ${className}`}>
      {animationData ? (
        <Lottie 
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        // Fallback minimal spinner
        <div className="w-full h-full border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );
}

