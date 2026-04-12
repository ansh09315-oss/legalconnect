const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database'); // Initialize SQLite

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'SQLite Server Running' });
});

// Case & Consultation Registration
app.post('/api/auth/register', (req, res) => {
  const { name, phone, hiredLawyer } = req.body;
  
  if (!name || !phone || !hiredLawyer) {
    return res.status(400).json({ error: 'Missing required client fields.' });
  }

  // We use INSERT OR REPLACE in case they consult/hire twice using the same phone number.
  const query = `
    INSERT OR REPLACE INTO clients (name, phone, hiredLawyerData)
    VALUES (?, ?, ?)
  `;
  
  db.run(query, [name.trim(), phone.trim(), JSON.stringify(hiredLawyer)], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database write failed.' });
    }
    res.status(201).json({ 
      status: 'success', 
      message: 'Client registered into SQLite backend successfully.',
      clientId: this.lastID
    });
  });
});

// Client Login Verification
app.post('/api/auth/login', (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing credentials.' });
  }

  const query = `SELECT * FROM clients WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND phone = ?`;
  
  db.get(query, [name, phone], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed.' });
    }

    if (row) {
      // Parse the JSON blob back into an object before sending it to the frontend
      row.hiredLawyer = JSON.parse(row.hiredLawyerData);
      delete row.hiredLawyerData;

      res.status(200).json({ status: 'success', user: row });
    } else {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SQLite Backend Server active on http://localhost:${PORT}`);
});
