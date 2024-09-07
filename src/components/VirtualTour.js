// src/components/VirtualTour.js

import React, { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TextureLoader, DoubleSide } from 'three';
import { Html } from '@react-three/drei';

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

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.005; // Adjust rotation speed

      // Update texture every 5 seconds
      const interval = setInterval(() => {
        setCurrentTextureIndex(prevIndex => (prevIndex + 1) % texturesMap.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }); 

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[500, 60, 40]} />
      {texturesMap.length > 0 && (
        <meshBasicMaterial map={texturesMap[currentTextureIndex]} side={DoubleSide} />
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
        const response = await fetch(`http://localhost:3001/list-images?folder=hotel`);
        const data = await response.json();

        // Sort images by name
        const sortedImages = data.sort().map(img => `/img/hotel/${img}`);
        setImages(sortedImages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Canvas style={{ height: '1349px', width: '100%' }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      {images.length > 0 && <Panorama textures={images} />}
    </Canvas>
  );
};

export default VirtualTour;
