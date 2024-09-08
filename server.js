const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser'); // Import body-parser

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
    const { full_name, email, phone, arrival_date, departure_date, number_of_nights, room_id, special_occasion, voucher } = req.body;
    const query = `
        INSERT INTO reservation (
            full_name, email, phone, arrival_date, departure_date, number_of_nights, room, special_occasion, voucher
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [full_name, email, phone, arrival_date, departure_date, number_of_nights, room_id, special_occasion || null, voucher], (err, result) => {
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
        zip_code
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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


// Define the port and start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
