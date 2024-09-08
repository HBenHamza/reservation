import React from "react";
import { getImageSrc } from '../Utils/imageUtils';

const Home = () => {
  return (
    <div>
      <div className="home-slide">
        <h2 className="title">hotel thapsus</h2>
        <a href="/virtualTour">take a virtual tour</a>
        <h2 className="title">good stuff place !</h2>
      </div>
      <div className="services">
        <div className="location">
          <h3>Hotel Thapsus</h3>
          <p>
            <img src={getImageSrc('/img/marker.png')} alt="marker" />
            <span>
               Zone Touristique Mahdia BP42, 5111 Mahdia, <br />
              Tunisie
            </span>
          </p>
        </div>
        <div className="facilities">
          <h3>FACILITIES</h3>
          <ul>
            <li>
              <img src={getImageSrc('/img/wifi.png')} />
              <p>wifi</p>
            </li>
            <li>
              <img src={getImageSrc('/img/coffee.png')} />
              <p>hot water</p>
            </li>
            <li>
              <img src={getImageSrc('/img/air.png')} />
              <p>air condition</p>
            </li>
            <li>
              <img src={getImageSrc('/img/phone.png')} />
              <p>intercom</p>
            </li>
            <li>
              <img src={getImageSrc('/img/parking.png')} />
              <p>free parking</p>
            </li>
            <li>
              <img src={getImageSrc('/img/room-service.png')} />
              <p>room service</p>
            </li>
          </ul>
        </div>
      </div>
      <div className="presentation">
        <h3>RESTAURANTS AND BARS</h3>
        <div className="hotel">
          <img src={getImageSrc('/img/home-resto.png')} />
          <p>
            Indulge in a sophisticated culinary journey at Thapsus. where our
            bars and restaurants offer an exquisite selection of food and
            beverages to satisfy even the most discerning palate. Whether you're
            looking for a casual drink with friends or an upscale dining
            experience, our hotel provides a variety of settings to meet your
            needs.
          </p>
        </div>
      </div>
      <div className="gallery">
        <h3>PHOTO GALLERY</h3>
        <div className="rooms">
          <img src={getImageSrc('/img/g-room-1.jpeg')} />
          <img src={getImageSrc('/img/g-room-2.jpeg')} />
          <img src={getImageSrc('/img/g-room-3.jpeg')} />
          <img src={getImageSrc('/img/g-room-4.jpeg')} />
          <img src={getImageSrc('/img/g-room-5.jpeg')} />
          <img src={getImageSrc('/img/g-room-6.jpeg')} />
          <img src={getImageSrc('/img/g-room-7.jpeg')} />
        </div>
      </div>
    </div>
  );
};

export default Home;
