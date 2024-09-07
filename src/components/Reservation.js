import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams for accessing URL params
import { getImageSrc } from '../Utils/imageUtils'; // Update the path as necessary

const Reservation = () => {
  const { roomId } = useParams(); // Get roomId from URL parameters

  // You can use roomId to fetch room-specific data if needed
  // For example, fetch room details or pre-fill reservation form fields

  const [step, setStep] = useState(0);

  const handleStartBooking = (e) => {
    e.preventDefault();
    setStep(1); // Show the first step
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2); // Move to the second step
  };

  return (
    <div>
      <div className={`make-reservation ${step === 0 ? '' : 'hidden'}`}>
        <div>
          <h2>Make your reservation</h2>
          <p>Submit this form and we will contact you shortly with further details.</p>
          <a href="#" onClick={handleStartBooking}>Start booking request</a>
        </div>
        <img src={getImageSrc('/img/vue.png')} alt="Vue" />
      </div>
      
      <div className={`checkout ${step === 1 ? 'show' : 'hidden'}`}>
        <div className={`step-1 step ${step === 1 ? 'showg' : 'hidden'}`}>
          <div className="forms">
            <div className="form">
              <h3>Guest Information</h3>
              <div className="form-group">
                <label htmlFor="full-name">Full Name</label>
                <input type="text" id="full-name" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input type="email" id="email" />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="text" id="phone" />
              </div>
            </div>

            <div className="form">
              <h3>Booking Details</h3>
              <div className="form-group">
                <label htmlFor="arrival-date">Arrival Date</label>
                <input type="date" id="arrival-date" />
              </div>
              <div className="form-group">
                <label htmlFor="departure-date">Departure Date</label>
                <input type="date" id="departure-date" />
              </div>
              <div className="form-group">
                <label htmlFor="nights">Number Of Nights</label>
                <input type="number" id="nights" />
              </div>
            </div>
          </div>
          <a href="#" className="next" onClick={handleNextStep}>Next →</a>
          <img src={getImageSrc('/img/vue.png')} alt="Vue" />
        </div>
      </div>

      <div className={`checkout ${step === 2 ? 'show' : 'hidden'}`}>
        <div className={`step-2 step ${step === 2 ? 'show' : 'hidden'}`}>
          <h3 className="one">Room type</h3>
          <div className="form room-type">
            <div>
              <input type="radio" name="room-type" value="Single" id="single" />
              <label htmlFor="single">Single</label>
            </div>
            <div>
              <input type="radio" name="room-type" value="Double" id="double" />
              <label htmlFor="double">Double</label>
            </div>
            <div>
              <input type="radio" name="room-type" value="Suite" id="suite" />
              <label htmlFor="suite">Suite</label>
            </div>
          </div>
          <div className="form special-occasion">
            <h3>Special occasion</h3>
            <p>"Celebrating something special? Let us know how we can make your stay memorable."</p>
            <div>
              <input type="radio" name="special-occasion" value="birthday" id="birthday" />
              <label htmlFor="birthday">Birthday</label>
            </div>
            <div>
              <input type="radio" name="special-occasion" value="honeymoon" id="honeymoon" />
              <label htmlFor="honeymoon">Honeymoon</label>
            </div>
            <div>
              <input type="radio" name="special-occasion" value="ceremony" id="ceremony" />
              <label htmlFor="ceremony">Ceremony</label>
            </div>
          </div>
          <div className="form confirmation">
            <h3>Confirmation</h3>
            <div className='form'>
              <div className="form-group">
                <label htmlFor="card-name">Name on card</label>
                <input type="text" id="card-name" />
              </div>
              <div className="form-group">
                <label htmlFor="card-num">Card Number</label>
                <input type="text" id="card-num" />
              </div>
              <div className="form-group expiration-date">
                <label>Expiration Date</label>
                <div>
                  <input type="text" id="expiration-date-d" placeholder="DD" />
                  <input type="text" id="expiration-date-m" placeholder="MM" />
                </div>
              </div>
            </div>
          </div>
          <a href="/payment" className="next" id="pay">Add</a>
        </div>
      </div>

      <div className="footer reserve">
        <div className="whatsapp">
          <img src={getImageSrc('/img/whatsapp.png')} alt="WhatsApp" />
          <p>+216 73 693 530</p>
        </div>
        <div className="gmail">
          <img src={getImageSrc('/img/gmail.png')} alt="Gmail" />
          <a href="mailto:thapsusresortcontact@gmail.com">thapsusresortcontact@gmail.com</a>
        </div>
        <div className="facebook">
          <img src={getImageSrc('/img/facebook.png')} alt="Facebook" />
          <a href="#">https://www.facebook.com/ThapsusMahdia/</a>
        </div>
        <div className="instagram">
          <img src={getImageSrc('/img/instagram.png')} alt="Instagram" />
          <a href="#">https://www.instagram.com/hotel_thapsus_mahdia?igsh=MXAzdjc4ODE0OWViYw==</a>
        </div>
        <p className="copyright">Copyright ©2024 All rights reserved</p>
      </div>
    </div>
  );
};

export default Reservation;
