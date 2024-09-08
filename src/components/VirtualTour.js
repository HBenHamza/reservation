// src/components/VirtualTour.js

import React, { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TextureLoader, DoubleSide } from 'three';

const Panorama = ({ textures }) => {
  const [currentTextureIndex, setCurrentTextureIndex] = useState(0);
  const [texturesMap, setTexturesMap] = useState([]);
  const ref = React.useRef();

  useEffect(() => {
    const loadTextures = async () => {
      const loader = new TextureLoader();
      const loadedTextures = await Promise.all(textures.map(url => loader.loadAsync(url)));
      setTexturesMap(loadedTextures);
    };

    loadTextures();
  }, [textures]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextureIndex(prevIndex => (prevIndex + 1) % texturesMap.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [texturesMap.length]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.005; // Adjust rotation speed if needed
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[150, 100, 80]} /> {/* Adjusted sphere radius and segments */}
      {texturesMap.length > 0 && (
        <meshBasicMaterial
          map={texturesMap[currentTextureIndex]}
          side={DoubleSide}
          toneMapped={false} // Disable tone mapping for clearer textures
        />
      )}
    </mesh>
  );
};

const VirtualTour = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`http://localhost:3001/list-images?folder=tour`);
        const data = await response.json();

        // Sort images by name
        const sortedImages = data.sort().map(img => `/img/tour/${img}`);
        setImages(sortedImages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</div>;

  return (
    <div style={{ height: '100vh', width: '100vw', margin: '0', padding: '0', overflow: 'hidden' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        {images.length > 0 && <Panorama textures={images} />}
      </Canvas>
    </div>
  );
};

export default VirtualTour;
