import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getImageSrc } from '../Utils/imageUtils';
import { useHistory } from 'react-router-dom';

const Rooms = () => {
  const [filter, setFilter] = useState('all');
  const [modalImage, setModalImage] = useState(null);
  const [modalCaption, setModalCaption] = useState('');
  const [detailsModal, setDetailsModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roomData, setRoomData] = useState({});
  const [roomItems, setRoomItems] = useState([]);

  const history = useHistory();

  useEffect(() => {
    // Fetch room data from the server
    const fetchRoomItems = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/rooms');
        const rooms = response.data;

        // Format the images array
        const formattedRooms = rooms.map(room => ({
          ...room,
          images: JSON.parse(room.images) // Ensure images are parsed if stored as JSON strings
        }));

        setRoomItems(formattedRooms);
      } catch (error) {
        console.error('Error fetching room data:', error);
      }
    };

    fetchRoomItems();
  }, []);

  useEffect(() => {
    if (detailsModal && roomData.images) {
      // Ensure index is valid
      if (currentIndex >= roomData.images.length + (roomData.video ? 1 : 0)) {
        setCurrentIndex(roomData.images.length - 1);
      }
    }
  }, [detailsModal, roomData, currentIndex]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleImageClick = (src, caption) => {
    setModalImage(src);
    setModalCaption(caption);
  };

  const checkIfVideoExists = async (folder) => {
    try {
      const response = await fetch(`http://localhost:3001/check-video?folder=${folder}`);
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Error checking video existence:', error);
      return false;
    }
  };

  const handleDetailsClick = async (folder) => {
    try {
      const response = await fetch(`http://localhost:3001/list-images?folder=${folder}`);
      const images = await response.json();
      const imageUrls = images.map(image => `./img/${folder}/${image}`);
      const room = roomItems.find(item => item.folder === folder);
      const videoExists = await checkIfVideoExists(folder);
      
      setRoomData({
        folder,
        images: imageUrls,
        title: room.title,
        description: room.price,
        video: videoExists ? `./img/${folder}/video.mp4` : null
      });
      setCurrentIndex(0); // Reset index when opening new details
      setDetailsModal(true);

      // Set the hidden input value
      document.getElementById('roomIdInput').value = room.id;
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prevIndex => {
      if (roomData.video && prevIndex === roomData.images.length) {
        // If at video, move to last image
        return roomData.images.length - 1;
      }
      return prevIndex === 0 ? (roomData.video ? roomData.images.length : roomData.images.length - 1) : prevIndex - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => {
      if (roomData.video && prevIndex === roomData.images.length - 1) {
        // If at last image and video exists, move to video
        return roomData.images.length;
      }
      if (roomData.video && prevIndex === roomData.images.length) {
        // If at video, move to first image
        return 0;
      }
      return prevIndex === (roomData.video ? roomData.images.length : roomData.images.length - 1) ? 0 : prevIndex + 1;
    });
  };

  const handleReserveClick = () => {
    const roomId = document.getElementById('roomIdInput').value;
    history.push(`/reservation/${roomId}`); // Pass the room's ID to the reservation page
  };

  return (
    <div>
      <div className="welcome">
        <p>Welcome</p>
      </div>
      <div className="our-rooms">
        <h3>OUR ALL ROOMS</h3>
        <div className="select-dropdown" id="filter">
          <select value={filter} onChange={handleFilterChange}>
            <option value="all">Filter By Room</option>
            <option value="single">Single Room</option>
            <option value="double">Double Room</option>
            <option value="suite">Family Suite Room</option>
          </select>
        </div>
        <ul>
          {roomItems
            .filter(room => filter === 'all' || room.type === filter)
            .map((room, index) => (
              <li key={index} className="room" data-type={room.type}>
                <img
                  src={getImageSrc(room.images[0])}
                  alt={room.title}
                  onClick={() => handleImageClick(getImageSrc(room.images[0]), room.title)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="details">
                  <p>
                    <span>{room.title}</span>
                    <span>Price: {room.price}</span>
                  </p>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleDetailsClick(room.folder); }}>Room details</a>
                </div>
              </li>
            ))}
        </ul>
      </div>
      {modalImage && (
        <div id="imageModal" className="modal" style={{ display: modalImage ? 'block' : 'none' }}>
          <span className="close" onClick={() => setModalImage(null)}>&times;</span>
          <img className="modal-content" src={modalImage} alt="Modal Room" />
          <div id="caption">{modalCaption}</div>
        </div>
      )}
      {detailsModal && (
        <div id="detailsModal" className="modal" style={{ display: detailsModal ? 'block' : 'none' }}>
          <span className="close" onClick={() => setDetailsModal(false)}>&times;</span>
          <div className="modal-content">
            <div className="modal-gallery">
              <a className="prev" onClick={handlePrev}>&#10094;</a>
              {currentIndex < roomData.images.length ? (
                <img className="gallery-image" src={roomData.images[currentIndex]} alt="Room Image" />
              ) : roomData.video ? (
                <div className="modal-video">
                  <video controls width="100%">
                    <source src={roomData.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : null}
              <a className="next" onClick={handleNext}>&#10095;</a>
            </div>
            <div className="modal-description">
              <h2>{roomData.title}</h2>
              <p>{roomData.description}</p>
              <input type="hidden" id="roomIdInput" />
              <button className="reserve-button" onClick={handleReserveClick}>Reserve this room</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
