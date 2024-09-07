import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Rooms from './components/Rooms';
import Reservation from './components/Reservation.js';
import Login from './components/Login';
import VirtualTour from './components/VirtualTour.js';
import Payment from './components/Payment.js';
import Menu from './components/_partials/Menu.js';
import Footer from './components/_partials/Footer.js';

function App() {
  return (
    <Router>
      <div>
        <Menu />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/rooms" component={Rooms} />
          <Route path="/reservation/:roomId" component={Reservation} />
          <Route path="/login" component={Login} />
          <Route path="/virtualTour" component={VirtualTour} />
          <Route path="/payment" component={Payment} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
