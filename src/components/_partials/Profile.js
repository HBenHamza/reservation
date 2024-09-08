import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert } from 'react-bootstrap'; // Ensure you have react-bootstrap installed
import { format, differenceInHours } from 'date-fns';

const Profile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const userId = localStorage.getItem('userId');
  
  const [reservations, setReservations] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [loading, setLoading] = useState(true);

  // Fetch user details and reservations on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user details
        const userResponse = await axios.get(`http://localhost:3001/api/user/details/${userId}`);
        setFormData({
          id: userId,
          username: userResponse.data.username,
          email: userResponse.data.email,
          password: '' // Password is not fetched or displayed
        });

        // Fetch user reservations
        const reservationsResponse = await axios.get(`http://localhost:3001/api/user/reservations/${userId}`); // Update the API endpoint as needed
        setReservations(reservationsResponse.data);
      } catch (error) {
        console.error('Error fetching user data or reservations:', error);
        setAlertMessage('Error fetching data.');
        setAlertType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3001/api/user/update', formData); // Update the API endpoint as needed
      setAlertMessage('Profile updated successfully!');
      setAlertType('success');
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlertMessage('Error updating profile.');
      setAlertType('error');
    }
  };

  const handleCancelReservation = async (reservationId, arrivalDate) => {
    const hoursUntilArrival = differenceInHours(new Date(arrivalDate), new Date());

    if (hoursUntilArrival <= 24) {
      setAlertMessage('You cannot cancel a reservation less than 24 hours before the arrival date.');
      setAlertType('error');
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/reservations/${reservationId}`);
      setReservations(reservations.filter(reservation => reservation.id !== reservationId));
      setAlertMessage('Reservation cancelled successfully.');
      setAlertType('success');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setAlertMessage('Error cancelling reservation.');
      setAlertType('error');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile">
      <h1>Profile</h1>
      
      {alertMessage && (
        <Alert variant={alertType}>
          {alertMessage}
        </Alert>
      )}

      {/* User Details Form */}
      <div className="profile-section">
        <h2>Update Your Details</h2>
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
            />
            <input
              id="id"
              type="hidden"
              value={formData.id}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Update Profile</button>
        </form>
      </div>

      {/* Reservations Data Table */}
      <div className="profile-section">
        <h2>Your Reservations</h2>
        <table>
          <thead>
            <tr>
              <th>Arrival Date</th>
              <th>Departure Date</th>
              <th>Number of Nights</th>
              <th>Special Occasion</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{format(new Date(reservation.arrival_date), 'yyyy-MM-dd')}</td>
                <td>{format(new Date(reservation.departure_date), 'yyyy-MM-dd')}</td>
                <td>{reservation.number_of_nights}</td>
                <td>{reservation.special_occasion || 'N/A'}</td>
                <td>{reservation.status}</td>
                <td>
                  <button
                    onClick={() => handleCancelReservation(reservation.id, reservation.arrival_date)}
                    disabled={!["confirmed", "pending"].includes(reservation.status)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Profile;
