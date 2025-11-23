'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LoadingAnimationProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingAnimation({ 
  message = 'Loading...', 
  size = 'md' 
}: LoadingAnimationProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Load the animation data
    fetch('/WalkingPencil.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        {animationData ? (
          <Lottie 
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          // Fallback spinner while animation loads
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      {message && (
        <p className={`${textSizes[size]} text-gray-600 font-normal tracking-tight`}>
          {message}
        </p>
      )}
    </div>
  );
}

