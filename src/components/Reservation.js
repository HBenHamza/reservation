import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom'; // Import useHistory for redirection
import { getImageSrc } from '../Utils/imageUtils'; // Update the path as necessary

// Custom Alert Component
const Alert = ({ message, onClose }) => {
    return (
        <div className="custom-alert">
            <div className="alert-content">
                <p>{message}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

// Function to generate a random voucher code
const generateVoucher = () => {
    return 'VOUCHER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const Reservation = () => {
    const { roomId } = useParams(); // Get roomId from URL parameters
    const history = useHistory(); // Use useHistory for redirection

    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        arrival_date: '',
        departure_date: '',
        number_of_nights: '',
        special_occasion: null // Default to null
    });
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTimeout, setAlertTimeout] = useState(null); // Store timeout ID for cleanup

    // Check if user is authenticated
    const isAuthenticated = () => {
        // Check authentication status (e.g., by checking if a token exists in localStorage)
        return !!localStorage.getItem('username');
    };

    // Function to show an alert with a delay before redirecting
    const showAlert = (message, redirectPath) => {
        setAlertMessage(message);
        // Clear any existing timeout
        if (alertTimeout) {
            clearTimeout(alertTimeout);
        }
        // Set timeout to redirect after displaying the alert
        const timeoutId = setTimeout(() => {
            setAlertMessage(''); // Clear the alert message
            history.push(redirectPath); // Redirect after the delay
        }, 3000); // Adjust the delay time as needed
        setAlertTimeout(timeoutId);
    };

    // Function to handle date changes and automatically calculate number of nights
    const handleDateChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => {
            const updatedData = { ...prevData, [id]: value };

            if (updatedData.arrival_date && updatedData.departure_date) {
                const arrivalDate = new Date(updatedData.arrival_date);
                const departureDate = new Date(updatedData.departure_date);

                // Check if departure date is greater than arrival date
                if (departureDate <= arrivalDate) {
                    setAlertMessage('Departure date must be later than arrival date.');
                    updatedData.number_of_nights = '';
                } else {
                    const numberOfNights = Math.max((departureDate - arrivalDate) / (1000 * 60 * 60 * 24), 1);
                    updatedData.number_of_nights = Math.ceil(numberOfNights);
                    setAlertMessage('');
                }
            }

            return updatedData;
        });
    };

    const validateFormData = () => {
        const { full_name, email, phone, arrival_date, departure_date, number_of_nights } = formData;
        if (!full_name || !email || !phone || !arrival_date || !departure_date || !number_of_nights) {
            setAlertMessage('Please fill in all required fields.');
            return false;
        }
        if (!/^[\w\s]+$/.test(full_name)) {
            setAlertMessage('Invalid name format.');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setAlertMessage('Invalid email format.');
            return false;
        }
        return true;
    };

    const handleStartBooking = (e) => {
        e.preventDefault();
        if (!isAuthenticated()) {
            showAlert('Please log in to proceed with the booking.', '/login'); // Show alert and redirect after delay
            return;
        }
        setStep(1); // Show the first step
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (step === 1) {
            if (!validateFormData()) return; // Validate before moving to the next step
            setStep(2); // Move to the second step
        }
    };

    const handleReservationSubmit = (e) => {
        e.preventDefault();
        const voucher = generateVoucher();

        fetch('http://localhost:3001/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...formData,
                room_id: roomId,
                voucher,
                re_status: 'pending'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setAlertMessage(data.error);
            } else {
                fetch(`http://localhost:3001/api/reservations/${data.reservation_id}`)
                .then(response => response.json())
                .then(reservationData => {
                    if (reservationData.error) {
                    setAlertMessage(reservationData.error);
                    } else {
                    const room_id = reservationData.room; // Adjust according to your data structure

                    // Fetch room details to get room price
                    fetch(`http://localhost:3001/api/rooms/${room_id}`)
                        .then(response => response.json())
                        .then(roomData => {
                        if (roomData.error) {
                            setAlertMessage(roomData.error);
                        } else {
                            const roomPrice = roomData.room_price; // Adjust according to your data structure
                            // Redirect to payment page with reservation_id and roomPrice
                            history.push(`/payment/${data.reservation_id}/${roomPrice}`);
                        }
                        })
                        .catch(error => {
                        setAlertMessage('An error occurred while fetching room details.');
                        });
                    }
                })
                .catch(error => {
                    setAlertMessage('An error occurred while fetching reservation details.');
                });

            }
        })
        .catch(error => {
            setAlertMessage('An error occurred while saving the reservation.');
        });
    };

    return (
        <div>
            {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage('')} />}

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
                                <input
                                  type="text"
                                  id="full_name"
                                  value={formData.full_name}
                                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email address</label>
                                <input
                                  type="email"
                                  id="email"
                                  value={formData.email}
                                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                  type="text"
                                  id="phone"
                                  value={formData.phone}
                                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form">
                            <h3>Booking Details</h3>
                            <div className="form-group">
                                <label htmlFor="arrival-date">Arrival Date</label>
                                <input
                                  type="date"
                                  id="arrival_date"
                                  value={formData.arrival_date}
                                  onChange={handleDateChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="departure-date">Departure Date</label>
                                <input
                                  type="date"
                                  id="departure_date"
                                  value={formData.departure_date}
                                  onChange={handleDateChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="nights">Number Of Nights</label>
                                <input
                                  type="number"
                                  id="number_of_nights"
                                  value={formData.number_of_nights}
                                  readOnly
                                />
                            </div>
                        </div>
                    </div>
                    <a href="#" className="next" onClick={handleNextStep}>Next →</a>
                    <img src={getImageSrc('/img/vue.png')} alt="Vue" />
                </div>
            </div>

            <div className={`checkout ${step === 2 ? 'show' : 'hidden'}`}>
                <div className={`step-2 step ${step === 2 ? 'show' : 'hidden'}`}>
                    <h3 className="one">Special occasion</h3>
                    <div className="form special-occasion">
                        <h3>Special occasion</h3>
                        <p>"Celebrating something special? Let us know how we can make your stay memorable."</p>
                        <div>
                            <input
                              type="radio"
                              name="special_occasion"
                              value="birthday"
                              id="birthday"
                              checked={formData.special_occasion === 'birthday'}
                              onChange={() => setFormData({...formData, special_occasion: 'birthday'})}
                            />
                            <label htmlFor="birthday">Birthday</label>
                        </div>
                        <div>
                            <input
                              type="radio"
                              name="special_occasion"
                              value="honeymoon"
                              id="honeymoon"
                              checked={formData.special_occasion === 'honeymoon'}
                              onChange={() => setFormData({...formData, special_occasion: 'honeymoon'})}
                            />
                            <label htmlFor="honeymoon">Honeymoon</label>
                        </div>
                        <div>
                            <input
                              type="radio"
                              name="special_occasion"
                              value="ceremony"
                              id="ceremony"
                              checked={formData.special_occasion === 'ceremony'}
                              onChange={() => setFormData({...formData, special_occasion: 'ceremony'})}
                            />
                            <label htmlFor="ceremony">Ceremony</label>
                        </div>
                    </div>
                    <a href="#" className="next" id="pay" onClick={handleReservationSubmit}>Proceed to Payment</a>
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
