import React, { useState, useEffect } from 'react';
import { getImageSrc2 } from '../Utils/imageUtils';

const folders = ['hotel', 'reception', 'bar', 'resto'];

const Hotel = () => {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [images, setImages] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    if (selectedFolder) {
      // Fetch images when a folder is selected
      fetch(`http://localhost:3001/api/images/${selectedFolder}`)
        .then(response => response.json())
        .then(data => setImages(data))
        .catch(error => console.error('Error fetching images:', error));
    }
  }, [selectedFolder]);

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
  };

  const handleBackClick = () => {
    setSelectedFolder(null);
    setImages([]);
    setZoomedImage(null); // Reset zoomed image when going back
  };

  const handleImageClick = (imageName) => {
    setZoomedImage(imageName);
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
  };

  const handleZoomClose = () => {
    setZoomedImage(null);
  };

  return (
    <div className="tour-container">
      {selectedFolder ? (
        <div>
          <button onClick={handleBackClick} className="back-button">Back</button>
          <div className="image-grid">
            {images.map((imageName) => (
              <img
                key={imageName}
                src={getImageSrc2(selectedFolder, imageName)}
                alt={imageName}
                className={`image-item ${zoomedImage === imageName ? 'zoomed' : ''}`}
                onClick={() => handleImageClick(imageName)}
              />
            ))}
          </div>
          {zoomedImage && (
            <div className="zoom-overlay" onClick={handleZoomClose}>
              <img
                src={getImageSrc2(selectedFolder, zoomedImage)}
                alt={zoomedImage}
                className="zoomed-image"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="folder-grid">
          {folders.map((folder) => (
            <div
              key={folder}
              className="folder-item"
              onClick={() => handleFolderClick(folder)}
            >
              <h3>{folder.charAt(0).toUpperCase() + folder.slice(1)}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hotel;
