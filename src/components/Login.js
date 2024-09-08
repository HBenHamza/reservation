import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import '../assets/login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const loginFormRef = useRef(null);
  const registerFormRef = useRef(null);
  const history = useHistory();

  const handleToggle = (formType) => {
    setIsLogin(formType === 'login');
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formType = isLogin ? 'login' : 'register';
  
    const formData = new FormData(event.target);
    const data = {
      username: formType === 'register' ? formData.get('username') : '',
      email: formData.get('email'),
      password: formData.get('password'),
    };
  
    try {
      const response = await fetch(`http://localhost:3001/api/${formType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      console.log('Server response:', result); // Add this line to inspect the response
  
      if (response.ok) {
        localStorage.setItem('username', result.user.username);
        localStorage.setItem('userId', result.user.id);
        setMessageType('success');
        setMessage(result.message);
  
        if (isLogin) {
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setIsLogin(true);
        }
      } else {
        setMessageType('error');
        setMessage(result.message || 'An error occurred'); // Ensure `result.message` is valid
      }
    } catch (error) {
      console.error('Error occurred:', error); // Add this line to log unexpected errors
      setMessageType('error');
      setMessage('An unexpected error occurred. Please try again later.');
    }
  
    if (isLogin && loginFormRef.current) {
      loginFormRef.current.reset();
    }
    if (!isLogin && registerFormRef.current) {
      registerFormRef.current.reset();
    }
  };
  

  return (
    <div className="container" id="login">
      <div className="box">
        <div className="toggle">
          <button
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => handleToggle('login')}
          >
            Login
          </button>
          <button
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => handleToggle('register')}
          >
            Register
          </button>
        </div>
        <div className="form-wrapper">
          {message && (
            <div className={`alert ${messageType}`}>
              {message}
            </div>
          )}
          {isLogin ? (
            <form id="login-form" onSubmit={handleSubmit} ref={loginFormRef}>
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" className="submit-btn">Login</button>
            </form>
          ) : (
            <form id="register-form" onSubmit={handleSubmit} ref={registerFormRef}>
              <input type="text" name="username" placeholder="Username" required />
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" className="submit-btn">Register</button>
            </form>
          )}
        </div>
        <a href="/" className="submit-btn return">Return to home</a>
      </div>
    </div>
  );
};

export default Login;
