import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

const Menu = () => {
  const [username, setUsername] = useState('');
  const history = useHistory();

  useEffect(() => {
    // Function to update the username from localStorage
    const updateUsername = () => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername('');
      }
    };

    // Initial update
    updateUsername();

    // Set up an event listener for storage changes
    window.addEventListener('storage', updateUsername);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('storage', updateUsername);
    };
  }, []);

  const handleLogout = () => {
    // Clear the user data from localStorage on logout
    localStorage.removeItem('username');
    setUsername('');
    history.push('/'); // Redirect to the home page
  };

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/rooms">All Rooms</Link></li>
        {username ? (
          <li className="dropdown">
            <button className="dropbtn">{username}</button>
            <div className="dropdown-content">
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </li>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Menu;
