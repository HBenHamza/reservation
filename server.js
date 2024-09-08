const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser'); // Import body-parser
const PDFDocument = require('pdfkit');
const moment = require('moment'); // For formatting dates

const app = express();

// Use CORS middleware
app.use(cors()); // This allows all origins. Configure it as needed.

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json()); // For parsing application/json

// Serve static files from the 'public/img' directory
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

// Endpoint to list images in a specified folder
app.get('/list-images', (req, res) => {
    const folder = req.query.folder;

    // Log the received folder parameter
    console.log(`Received folder parameter: ${folder}`);

    if (!folder) {
        return res.status(400).json({ error: 'Folder parameter is missing' });
    }

    const directoryPath = path.join(__dirname, 'public', 'img', folder);

    // Log the directory path being accessed
    console.log(`Accessing directory: ${directoryPath}`);

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            // Log the error
            console.error(`Error reading directory ${directoryPath}:`, err);
            return res.status(500).json({ error: 'Unable to scan directory' });
        }

        // Filter out image files
        const images = files.filter(file => /\.(jpeg|jpg|png|gif)$/.test(file));
        res.json(images);
    });
});

app.get('/check-video', (req, res) => {
    const { folder } = req.query;
    const videoPath = path.join(__dirname, 'public', 'img', folder, 'video.mp4');
  
    fs.access(videoPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ exists: false });
        }
        res.json({ exists: true });
    });
});

app.get('/api/images', (req, res) => {
    const folderPath = path.join(__dirname, 'public/img/hotel');
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }
        const images = files.filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'));
        res.json(images);
    });
});

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'thapsus'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// Register User
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Insert user into the database
        const user = { username, email, password: hashedPassword };
        db.query('INSERT INTO users SET ?', user, (err, result) => {
            if (err) throw err;
            res.json({ message: 'User registered successfully' });
        });
    });
});

// Login User
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = result[0];

        // Compare passwords
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.json({ message: 'Login successful', user: user });
    });
});

// Endpoint to handle reservation data
app.post('/api/reservations', (req, res) => {
    const { 
        full_name, 
        email, 
        phone, 
        arrival_date, 
        departure_date, 
        number_of_nights, 
        room_id, 
        special_occasion, 
        voucher,
        re_status
    } = req.body;

    const query = `
        INSERT INTO reservation (
            full_name, email, phone, arrival_date, departure_date, number_of_nights, room, special_occasion, voucher, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [full_name, email, phone, arrival_date, departure_date, number_of_nights, room_id, special_occasion || null, voucher, re_status], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ reservation_id: result.insertId });
    });
});


app.get('/api/reservations/:reservation_id', (req, res) => {
    const reservationId = parseInt(req.params.reservation_id);
    const query = `SELECT * FROM reservation WHERE id = ?`;

    db.query(query, [reservationId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        const reservationData = results[0];
        res.status(200).json(reservationData);
    });
});

app.post('/api/reservations/update-status', (req, res) => {
    const { reservation_id, status } = req.body;
  
    // Validate inputs
    if (!reservation_id || !status) {
      return res.status(400).json({ error: 'Reservation ID and status are required.' });
    }
  
    const query = `
      UPDATE reservation
      SET status = ?
      WHERE id = ?
    `;
  
    db.query(query, [status, reservation_id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Reservation not found.' });
      }
  
      res.status(200).json({ message: 'Reservation status updated successfully.' });
    });
  });
  

  
  // Endpoint to handle payment data
  app.post('/api/payments', (req, res) => {
    const { 
      transaction_id, 
      reservation_id, 
      user_id, 
      name_on_card, 
      card_number, 
      expiry_date, 
      security_code, 
      zip_code 
    } = req.body;
  
    const query = `
      INSERT INTO payment (
        transaction_id, 
        reservation_id, 
        user_id, 
        name_on_card, 
        card_number, 
        expiry_date, 
        security_code, 
        zip_code,
        date
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
  
    db.query(query, [
      transaction_id, 
      reservation_id, 
      user_id, 
      name_on_card, 
      card_number, 
      expiry_date, 
      security_code, 
      zip_code
    ], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: 'Payment processed successfully' });
    });
  });
  
// Endpoint to get room data
app.get('/api/rooms', (req, res) => {
    db.query('SELECT * FROM rooms', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Route to get room details by ID
app.get('/api/rooms/:room_id', (req, res) => {
    const roomId = req.params.room_id;
    
    const query = 'SELECT * FROM rooms WHERE id = ?'; // Adjust table and column names as needed
  
    db.query(query, [roomId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }
  
      const room = results[0];
      res.status(200).json({
        room_id: room.id,
        room_price: room.price // Adjust according to your column names
      });
    });
  });

  // Endpoint to fetch user details
  app.get('/api/user/details/:userId', (req, res) => {
    const userId = req.params.userId; // Get user ID from request parameters
  
    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
  
    // Query to get user details from the database
    db.query('SELECT username, email FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
  
      res.json(results[0]);
    });
  });
  
  
  // Endpoint to update user details
  app.put('/api/user/update', (req, res) => {
    const { username, email, password , id} = req.body;
    db.query(
      'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
      [username, email, password, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated successfully' });
      }
    );
  });
  
  // Endpoint to fetch user reservations
app.get('/api/user/reservations/:userId', (req, res) => {
    const userId = req.params.userId; // Get user ID from request parameters
  
    // Step 1: Fetch all payments for the user
    db.query('SELECT reservation_id FROM payment WHERE user_id = ?', [userId], (err, paymentResults) => {
      if (err) return res.status(500).json({ error: err.message });
  
      // Extract reservation IDs from payments
      const reservationIds = paymentResults.map(payment => payment.reservation_id);
  
      if (reservationIds.length === 0) {
        return res.json([]); // No reservations found
      }
  
      // Step 2: Fetch reservations based on the reservation IDs
      db.query('SELECT * FROM reservation WHERE id IN (?)', [reservationIds], (err, reservationResults) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(reservationResults);
      });
    });
  });
  
  
  // Endpoint to cancel a reservation
  app.delete('/api/reservations/:id', (req, res) => {
    const reservationId = req.params.id;
      // Cancel the reservation
      db.query('UPDATE reservation SET status = "canceled" WHERE id = ?', [reservationId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Reservation cancelled successfully' });
      });
    });  


    // Endpoint to fetch all users
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Endpoint to fetch all reservations
app.get('/api/reservations', (req, res) => {
  db.query('SELECT * FROM reservation', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Endpoint to fetch all payments
app.get('/api/payments', (req, res) => {
  db.query('SELECT * FROM payment', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Endpoint to generate invoice PDF
app.get('/api/invoice/:paymentId', async (req, res) => {
  const paymentId = req.params.paymentId;

  // Fetch payment details
  db.query('SELECT * FROM payment WHERE id = ?', [paymentId], async (err, paymentResults) => {
    if (err) return res.status(500).json({ error: err.message });
    const payment = paymentResults[0];

    // Fetch reservation details
    db.query('SELECT * FROM reservation WHERE id = ?', [payment.reservation_id], async (err, reservationResults) => {
      if (err) return res.status(500).json({ error: err.message });
      const reservation = reservationResults[0];

      // Fetch user details
      db.query('SELECT * FROM users WHERE id = ?', [payment.user_id], async (err, userResults) => {
        if (err) return res.status(500).json({ error: err.message });
        const user = userResults[0];

        // Generate PDF
        const doc = new PDFDocument();
        let filename = `invoice_${paymentId}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-type', 'application/pdf');
        
        doc.pipe(res);

        doc.fillColor('red').fontSize(14).text(`Invoice for Payment ID: ${paymentId}`, {
          align: 'center'
        }).moveDown();
        
        doc.fillColor('red').fontSize(14).text(`User Details:`);
        doc.fillColor('black').fontSize(14).text(`User: ${user.username}`);
        doc.text(`Email: ${user.email}`).moveDown();;

        doc.fillColor('red').fontSize(14).text(`Reservation Details:`);
        doc.fillColor('black').fontSize(14).text(`Arrival Date: ${moment(reservation.arrival_date).format('MMMM D, YYYY HH:mm:ss')}`);
        doc.fillColor('black').fontSize(14).text(`Departure Date: ${moment(reservation.departure_date).format('MMMM D, YYYY HH:mm:ss')}`);
        doc.fontSize(14).text(`Number of Nights: ${reservation.number_of_nights}`).moveDown();
        
        doc.fillColor('red').fontSize(14).text(`Payment Details:`)
        doc.fillColor('black').fontSize(14).text(`Transaction ID: ${payment.transaction_id}`);
        doc.fillColor('black').fontSize(14).text(`Payment Date: ${moment(payment.date).format('MMMM D, YYYY HH:mm:ss')}`); // Format the payment date
        
        doc.end();
      });
    });
  });
});




// Define the port and start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
