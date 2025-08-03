'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamic import with loading fallback
const STLViewer = dynamic(() => {
  console.log('Attempting to load STL Viewer component...');
  return import('./STLViewer').then((module) => {
    console.log('STL Viewer component loaded successfully');
    return module;
  }).catch((error) => {
    console.error('Failed to load STL Viewer component:', error);
    throw error;
  });
}, {
  ssr: false, // Disable server-side rendering for Three.js
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ width: '100%', height: '400px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <div className="text-gray-600">Loading 3D Viewer...</div>
      </div>
    </div>
  ),
});

export default function DynamicSTLViewer({ fileUrl, width, height, showControls, onLoad, onError }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = (error) => {
    setIsLoaded(true);
    if (onError) onError(error);
  };

  return (
    <STLViewer
      fileUrl={fileUrl}
      width={width}
      height={height}
      showControls={showControls}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
} 