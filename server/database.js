const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite DB in the server directory
const dbPath = path.resolve(__dirname, 'legalconnect.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Initialize Tables
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      hiredLawyerData TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating clients table', err.message);
      } else {
        console.log('Clients table ready.');
      }
    });
  }
});

module.exports = db;
