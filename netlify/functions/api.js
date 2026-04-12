const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb+srv://t0289245_db_user:0QSEsUSl2KaYrenb@cluster0.fhqzt6d.mongodb.net/?appName=Cluster0";

// Maintain cached DB connection for serverless cold starts
let conn = null;
const connectDB = async () => {
  if (conn == null) {
    conn = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    }).then(() => mongoose);
    await conn;
  }
  return conn;
};

// Define Schema
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  hiredLawyerData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);

// Registration / Case Submission Route
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { name, phone, hiredLawyer } = req.body;
    
    if (!name || !phone || !hiredLawyer) {
      return res.status(400).json({ error: 'Missing required client fields.' });
    }

    const newClient = await Client.findOneAndUpdate(
      { phone: phone.trim() },
      { name: name.trim(), hiredLawyerData: hiredLawyer },
      { new: true, upsert: true }
    );

    res.status(201).json({ 
      status: 'success', 
      message: 'Client registered into MongoDB successfully.',
      clientId: newClient._id
    });
  } catch (err) {
    console.error("MongoDB Register Error:", err);
    res.status(500).json({ error: 'MongoDB database registration failed.' });
  }
});

// Login Verification Route
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Missing credentials.' });
    }

    // Exact Match Name (Case Insensitive) and Phone
    const user = await Client.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      phone: phone.trim()
    });

    if (user) {
      const userPayload = {
        name: user.name,
        phone: user.phone,
        hiredLawyer: user.hiredLawyerData
      };
      res.status(200).json({ status: 'success', user: userPayload });
    } else {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }
  } catch (err) {
    console.error("MongoDB Login Error:", err);
    res.status(500).json({ error: 'Database query failed.' });
  }
});

module.exports.handler = serverless(app);
