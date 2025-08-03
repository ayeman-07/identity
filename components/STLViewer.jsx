'use client';

import { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

// STL Model Component
function STLModel({ url, onLoad, onError }) {
  const meshRef = useRef();
  const [geometry, setGeometry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loader = new STLLoader();
    
    // Set a timeout for large files
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError(new Error('File is too large or taking too long to load. Please try a smaller STL file.'));
        setLoading(false);
      }
    }, 15000); // 15 second timeout
    
    loader.load(
      url,
      (geometry) => {
        clearTimeout(timeoutId);
        
        // Check if geometry is valid
        if (!geometry || !geometry.attributes.position) {
          setError(new Error('Invalid STL file format'));
          setLoading(false);
          return;
        }
        
        // Center the geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);
        
        // Scale to fit in view
        const box = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        geometry.scale(scale, scale, scale);
        
        setGeometry(geometry);
        setLoading(false);
        if (onLoad) onLoad();
      },
      (progress) => {
        // Progress callback
        console.log('Loading progress:', (progress.loaded / progress.total) * 100, '%');
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error('Error loading STL:', error);
        setError(error);
        setLoading(false);
        if (onError) onError(error);
      }
    );
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [url, onLoad, onError]);

  useFrame(() => {
    if (meshRef.current) {
      // Optional: Add subtle rotation animation
      // meshRef.current.rotation.y += 0.001;
    }
  });

  if (loading) {
    return (
      <Html center>
        <div className="text-white bg-black bg-opacity-50 px-4 py-2 rounded">
          Loading STL model...
        </div>
      </Html>
    );
  }

  if (error) {
    return (
      <Html center>
        <div className="text-red-500 bg-black bg-opacity-50 px-4 py-2 rounded">
          Error loading model: {error.message}
        </div>
      </Html>
    );
  }

  if (!geometry) {
    return null;
  }

  return (
    <mesh ref={meshRef}>
      <primitive object={geometry} />
      <meshStandardMaterial 
        color="#4f46e5" 
        metalness={0.1}
        roughness={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Main STL Viewer Component
export default function STLViewer({ 
  fileUrl, 
  width = '100%', 
  height = '400px',
  showControls = true,
  onLoad,
  onError 
}) {
  const [resetKey, setResetKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsRef = useRef();
  const containerRef = useRef();

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setResetKey(prev => prev + 1);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ width, height }}>
        <div className="text-gray-500 text-center">
          <div className="text-2xl mb-2">📁</div>
          <div>No STL file available</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${isFullscreen ? 'w-full h-full bg-gray-900' : ''}`} 
      style={isFullscreen ? { width: '100vw', height: '100vh' } : { width, height }}
    >
      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button
            onClick={toggleFullscreen}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? '🗗 Exit' : '🗖 Fullscreen'}
          </button>
          <button
            onClick={handleReset}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
            title="Reset View"
          >
            🔄 Reset
          </button>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        key={resetKey}
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #1e293b, #334155)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Simple lighting instead of Environment */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />

        {/* Grid Helper */}
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#6b7280" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#374151" 
          fadeDistance={25} 
          fadeStrength={1} 
          followCamera={false} 
          infiniteGrid={true} 
        />

        {/* STL Model */}
        <Suspense fallback={
          <Html center>
            <div className="text-white bg-black bg-opacity-50 px-4 py-2 rounded">
              Loading...
            </div>
          </Html>
        }>
          <STLModel 
            url={fileUrl} 
            onLoad={onLoad}
            onError={onError}
          />
        </Suspense>

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={50}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>

      {/* Instructions */}
      <div className={`absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded ${isFullscreen ? 'text-base' : ''}`}>
        <div>🖱️ Left click + drag: Rotate</div>
        <div>🖱️ Right click + drag: Pan</div>
        <div>🖱️ Scroll: Zoom</div>
        {isFullscreen && <div>🔲 Press ESC to exit fullscreen</div>}
      </div>
    </div>
  );
} 