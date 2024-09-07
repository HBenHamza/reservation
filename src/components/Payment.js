import React, { useState } from 'react';
import axios from 'axios';
import { Alert } from 'react-bootstrap'; // Ensure you have react-bootstrap installed
import { useHistory } from 'react-router-dom';

const Payment = () => {
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nameOnCard, cardNumber, expiryDate, securityCode, zipCode } = formData;

    if (!nameOnCard || !cardNumber || !expiryDate || !securityCode || !zipCode) {
      console.log('Missing fields detected'); // Debug log
      setAlertMessage('Please fill in all fields.');
      setAlertType('error');
      return;
    }

    // Fake data
    const fakeReservationId = generateRandomString(10);
    const fakeUserId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : generateRandomString(5);
    const fakeTransactionId = generateRandomString(16);

    const reservationData = {
      phone: '123-456-7890',
      arrival_date: '2024-09-07',
      departure_date: '2024-09-14',
      number_of_nights: 7,
      voucher: generateRandomString(8),
      room_id: 1
    };

    const paymentData = {
      transaction_id: fakeTransactionId,
      reservation_id: 2,
      user_id: 1,
      name_on_card: nameOnCard,
      card_number: cardNumber,
      expiry_date: expiryDate,
      security_code: securityCode,
      zip_code: zipCode
    };

    try {
      await axios.post('http://localhost:3001/api/reservations', reservationData);
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
              <span>250.00 </span>
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
            <span className="align-middle">Pay 250.00 TND</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
