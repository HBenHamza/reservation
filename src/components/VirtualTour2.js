import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { getImageSrc2 } from '../Utils/imageUtils';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const folders = ['hotel', 'reception', 'bar', 'resto'];

const VirtualTour2 = () => {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [images, setImages] = useState([]);

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
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 50,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Enable automatic animation
    autoplaySpeed: 3000, // Change slide every 3 seconds
  };

  return (
    <div className="tour-container">
      {selectedFolder ? (
        <div>
          <button onClick={handleBackClick} className="back-button">Back</button>
          <Slider {...settings}>
            {images.map((imageName) => (
              <div key={imageName} className="slide">
                <img
                  src={getImageSrc2(selectedFolder, imageName)}
                  alt={imageName}
                  className="slide-image"
                />
              </div>
            ))}
          </Slider>
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

export default VirtualTour2;
