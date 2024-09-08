import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-bootstrap'; // Ensure you have react-bootstrap installed
import { useHistory, useParams } from 'react-router-dom';

const Payment = () => {
  const { reservation_id } = useParams(); // Get reservation_id from URL parameters
  const history = useHistory();

  const [formData, setFormData] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    zipCode: ''
  });
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [roomPrice, setRoomPrice] = useState(0);

  useEffect(() => {
    // Retrieve roomPrice from sessionStorage
    const storedRoomPrice = sessionStorage.getItem('roomPrice');
    if (storedRoomPrice) {
      setRoomPrice(parseFloat(storedRoomPrice));
    } else {
      setAlertMessage('Room price not found. Please return to the reservation page.');
      setAlertType('error');
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const validateForm = () => {
    const { nameOnCard, cardNumber, expiryDate, securityCode, zipCode } = formData;

    // Name on Card: Not empty
    if (!nameOnCard.trim()) {
      setAlertMessage('Name on card is required.');
      setAlertType('error');
      return false;
    }

    // Card Number: Valid length and format (basic validation)
    if (!/^(\d{13,19})$/.test(cardNumber)) {
      setAlertMessage('Card number must be between 13 and 19 digits.');
      setAlertType('error');
      return false;
    }

    // Expiry Date: Valid MM/YY format and not expired
    const expiryPattern = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    const today = new Date();
    const [month, year] = expiryDate.split('/');
    if (!expiryPattern.test(expiryDate)) {
      setAlertMessage('Expiry date must be in MM/YY format.');
      setAlertType('error');
      return false;
    }
    const expiryYear = parseInt(`20${year}`, 10);
    const expiryMonth = parseInt(month, 10);
    if (expiryYear < today.getFullYear() || (expiryYear === today.getFullYear() && expiryMonth < today.getMonth() + 1)) {
      setAlertMessage('Card has expired.');
      setAlertType('error');
      return false;
    }

    // Security Code: 3 or 4 digits
    if (!/^\d{3,4}$/.test(securityCode)) {
      setAlertMessage('Security code must be 3 or 4 digits.');
      setAlertType('error');
      return false;
    }

    // ZIP/Postal Code: Basic validation (adjust pattern as needed)
    if (!/^\d{5,10}$/.test(zipCode)) {
      setAlertMessage('ZIP/Postal code must be between 5 and 10 digits.');
      setAlertType('error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Perform validation before submission

    const { nameOnCard, cardNumber, expiryDate, securityCode, zipCode } = formData;

    // Create payment data
    const paymentData = {
      transaction_id: generateRandomString(16),
      reservation_id: reservation_id, // Use the reservation ID from URL
      user_id: 1, // Replace with actual user ID retrieval logic
      name_on_card: nameOnCard,
      card_number: cardNumber,
      expiry_date: expiryDate,
      security_code: securityCode,
      zip_code: zipCode
    };

    try {
      await axios.post('http://localhost:3001/api/payments', paymentData);
      setAlertMessage('Payment processed successfully!');
      setAlertType('success');
      setTimeout(() => {
        history.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
      setAlertMessage('Error processing payment. Please try again.');
      setAlertType('error');
    }
  };

  const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  return (
    <div className="container">
      <div id="Checkout" className="inline">
        <h1>Pay Invoice</h1>
        <div className="card-row">
          <span className="visa"></span>
          <span className="mastercard"></span>
          <span className="amex"></span>
          <span className="discover"></span>
        </div>
        <form onSubmit={handleSubmit}>
          {alertMessage && (
            <Alert variant={alertType}>
              {alertMessage}
            </Alert>
          )}
          <div className="form-group">
            <label htmlFor="PaymentAmount">Payment amount</label>
            <div className="amount-placeholder">
              <span>{roomPrice.toFixed(2)} </span>
              <span>TND</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="nameOnCard">Name on card</label>
            <input
              id="nameOnCard"
              className="form-control"
              type="text"
              maxLength="255"
              value={formData.nameOnCard}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cardNumber">Card number</label>
            <input
              id="cardNumber"
              className="form-control"
              type="text"
              value={formData.cardNumber}
              onChange={handleChange}
            />
          </div>
          <div className="expiry-date-group form-group">
            <label htmlFor="expiryDate">Expiry date</label>
            <input
              id="expiryDate"
              className="form-control"
              type="text"
              placeholder="MM / YY"
              maxLength="7"
              value={formData.expiryDate}
              onChange={handleChange}
            />
          </div>
          <div className="security-code-group form-group">
            <label htmlFor="securityCode">Security code</label>
            <div className="input-container">
              <input
                id="securityCode"
                className="form-control"
                type="text"
                value={formData.securityCode}
                onChange={handleChange}
              />
              <i id="cvc" className="fa fa-question-circle"></i>
            </div>
          </div>
          <div className="zip-code-group form-group">
            <label htmlFor="zipCode">ZIP/Postal code</label>
            <div className="input-container">
              <input
                id="zipCode"
                className="form-control"
                type="text"
                maxLength="10"
                value={formData.zipCode}
                onChange={handleChange}
              />
              <a tabindex="0" role="button" data-toggle="popover" data-trigger="focus" data-placement="left" data-content="Enter the ZIP/Postal code for your credit card billing address.">
                <i className="fa fa-question-circle"></i>
              </a>
            </div>
          </div>
          <button id="PayButton" className="btn btn-block btn-success submit-button" type="submit">
            <span className="submit-button-lock"></span>
            <span className="align-middle">Pay {roomPrice.toFixed(2)} TND</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
