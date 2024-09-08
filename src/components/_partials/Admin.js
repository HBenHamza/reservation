// src/components/Admin.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import PasswordPrompt from '../PasswordPrompt'; // Import the PasswordPrompt component

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (authenticated) {
      // Fetch data only if authenticated
      const fetchData = async () => {
        try {
          const [usersRes, reservationsRes, paymentsRes] = await Promise.all([
            axios.get('http://localhost:3001/api/users'),
            axios.get('http://localhost:3001/api/reservations'),
            axios.get('http://localhost:3001/api/payments')
          ]);
          setUsers(usersRes.data);
          setReservations(reservationsRes.data);
          setPayments(paymentsRes.data);
        } catch (error) {
          console.error('Error fetching data', error);
        }
      };

      fetchData();
    }
  }, [authenticated]);

  const handleCancelReservation = async (reservationId) => {
    try {
      // Check if reservation can be canceled
      const reservation = reservations.find(r => r.id === reservationId);
      const arrivalDate = new Date(reservation.arrival_date);
      const now = new Date();
      const timeDiff = arrivalDate - now;
      const daysUntilArrival = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysUntilArrival <= 1) {
        alert('You cannot cancel the reservation less than 24 hours before the arrival date.');
        return;
      }

      // Proceed with cancellation
      await axios.delete(`http://localhost:3001/api/reservations/${reservationId}`);
      setReservations(reservations.filter(r => r.id !== reservationId));
      alert('Reservation canceled successfully.');
    } catch (error) {
      console.error('Error canceling reservation', error);
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/invoice/${paymentId}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading invoice', error);
    }
  };

  if (!authenticated) {
    return <PasswordPrompt onAuthenticate={() => setAuthenticated(true)} />;
  }

  return (
    <div className='container' id='admin'>
      <h1>Admin Dashboard</h1>

      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Reservations</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Arrival Date</th>
            <th>Departure Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(reservation => (
            <tr key={reservation.id}>
              <td>{reservation.id}</td>
              <td>{reservation.full_name}</td>
              <td>{format(new Date(reservation.arrival_date), 'yyyy-MM-dd')}</td>
              <td>{format(new Date(reservation.departure_date), 'yyyy-MM-dd')}</td>
              <td>{reservation.status}</td>
              <td>
                <button onClick={() => handleCancelReservation(reservation.id)}
                   disabled={reservation.status === 'canceled'}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Payments</h2>
      <table>
        <thead>
          <tr>
            <th>Reservation ID</th>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.reservation_id}</td>
              <td>{payment.transaction_id}</td>
              <td>{format(new Date(payment.date), 'yyyy-MM-dd')}</td>
              <td>
                <button onClick={() => handleDownloadInvoice(payment.id)}>Download Invoice</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
