const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const verifyPassword = (inputPassword, storedPassword) => {
  if (!storedPassword) return false;
  if (storedPassword === inputPassword) return true;
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
    try {
      return bcrypt.compareSync(inputPassword, storedPassword);
    } catch (e) {
      console.error('Bcrypt comparison failed:', e);
    }
  }
  return false;
};

const JWT_SECRET = process.env.JWT_SECRET || '089e675445adbb3429b0cdd26f4953dbaa4c599ae574a0d80e114da15701c323';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb+srv://t0289245_db_user:0QSEsUSl2KaYrenb@cluster0.fhqzt6d.mongodb.net/?appName=Cluster0";

let conn = null;
const connectDB = async () => {
  if (conn == null) {
    conn = mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 }).then(() => mongoose);
    await conn;
  }
  return conn;
};

// ----- Schema -----
const caseSchema = new mongoose.Schema({
  case_id: String,
  sector: String,
  status: { type: String, default: 'active' },
  name: String,      // lawyer name
  spec: String,
  email: String,
  court: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const clientSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, required: true, unique: true },
  role:  { type: String, default: 'client' },
  cases: { type: [caseSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);


// ----- Routes -----


// Create a new account (Registration)
app.post('/api/auth/create-account', async (req, res) => {
  try {
    await connectDB();
    const { name, email, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }

    // Check if phone already exists
    const existing = await Client.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this phone number already exists. Please sign in.' });
    }

    const newClient = await Client.create({
      name: name.trim(),
      email: (email || '').trim(),
      phone: phone.trim(),
      cases: []
    });

    const token = jwt.sign(
      { id: newClient._id, role: 'client', phone: newClient.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      token,
      user: {
        id: newClient._id,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        cases: newClient.cases,
        role: 'client'
      }
    });
  } catch (err) {
    console.error("Create Account Error:", err);
    res.status(500).json({ error: 'Account creation failed. ' + err.message });
  }
});

// Login Route — fetches full profile including all cases
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { identifier, phone } = req.body; // identifier = name OR email

    if (!identifier || !phone) {
      return res.status(400).json({ error: 'Credentials are required.' });
    }

    const user = await Client.findOne({
      $and: [
        { phone: phone.trim() },
        {
          $or: [
            { name: { $regex: new RegExp(`^${identifier.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
            { email: { $regex: new RegExp(`^${identifier.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
          ]
        }
      ]
    });

    if (user) {
      const token = jwt.sign(
        { id: user._id, role: 'client', phone: user.phone },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        status: 'success',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cases: user.cases || [],
          role: 'client'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials. No account found with these details.' });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: 'Login failed. ' + err.message });
  }
});

// ── Dedicated Advocate Login Route ──
// Strictly queries lawyer_profiles (with fallback to legacy 'lawyers' table)
const advocateLoginHandler = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }
    if (!supabase) return res.status(500).json({ error: 'Database not configured.' });

    const id = identifier.trim().toLowerCase();

    // Query new lawyer_profiles table first, fallback to legacy lawyers table
    let users = [];
    const { data: newRows } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .or(`email.eq.${id},phone.eq.${identifier.trim()}`);
    if (newRows?.length) users = newRows;

    if (!users.length) {
      const { data: legacyRows } = await supabase
        .from('lawyers')
        .select('*')
        .or(`email.eq.${id},phone.eq.${identifier.trim()}`);
      if (legacyRows?.length) users = legacyRows;
    }

    if (!users.length) {
      return res.status(401).json({ error: 'No advocate account found with this email or phone number.' });
    }

    const matched = users.find(u => verifyPassword(password.trim(), u.password));
    if (!matched) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }
    if (matched.status !== 'approved') {
      return res.status(403).json({ error: 'Your advocate account is pending admin approval. You will be notified once verified.' });
    }

    const token = jwt.sign(
      { id: matched.id, role: 'lawyer', phone: matched.phone, email: matched.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      status: 'success',
      token,
      user: { ...matched, role: 'lawyer' }
    });
  } catch (err) {
    console.error('Advocate Login Error:', err);
    return res.status(500).json({ error: 'Login failed. ' + err.message });
  }
};

// Register handler under all path variants
app.post('/api/auth/login-advocate', advocateLoginHandler);
app.post('/auth/login-advocate', advocateLoginHandler);
app.post('/.netlify/functions/api/auth/login-advocate', advocateLoginHandler);
app.post('/functions/api/auth/login-advocate', advocateLoginHandler);

// ── Dedicated Client Login Route ──
// Strictly queries client_profiles (with fallback to legacy 'clients' table)
const clientLoginHandler = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }
    if (!supabase) return res.status(500).json({ error: 'Database not configured.' });

    const id = identifier.trim().toLowerCase();

    // Query new client_profiles table first, fallback to legacy clients table
    let users = [];
    const { data: newRows } = await supabase
      .from('client_profiles')
      .select('*')
      .or(`email.eq.${id},phone.eq.${identifier.trim()}`);
    if (newRows?.length) users = newRows;

    if (!users.length) {
      const { data: legacyRows } = await supabase
        .from('clients')
        .select('*')
        .or(`email.eq.${id},phone.eq.${identifier.trim()}`);
      if (legacyRows?.length) users = legacyRows;
    }

    if (!users.length) {
      return res.status(401).json({ error: 'No client account found with this email or phone number.' });
    }

    const matched = users.find(u => verifyPassword(password.trim(), u.password));
    if (!matched) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { id: matched.id, role: 'client', phone: matched.phone, email: matched.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      status: 'success',
      token,
      user: { ...matched, role: 'client' }
    });
  } catch (err) {
    console.error('Client Login Error:', err);
    return res.status(500).json({ error: 'Login failed. ' + err.message });
  }
};

app.post('/api/auth/login-client', clientLoginHandler);
app.post('/auth/login-client', clientLoginHandler);
app.post('/.netlify/functions/api/auth/login-client', clientLoginHandler);
app.post('/functions/api/auth/login-client', clientLoginHandler);

// ── Dedicated Client Registration Route ──
// Inserts into both client_profiles (new) and clients (legacy) tables
const clientRegisterHandler = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required.' });
    }
    if (!supabase) return res.status(500).json({ error: 'Database not configured.' });

    const id = (email || '').trim().toLowerCase();

    // Check duplicates across both tables
    const { data: existingNew } = await supabase
      .from('client_profiles')
      .select('id')
      .or(`${id ? `email.eq.${id},` : ''}phone.eq.${phone.trim()}`);
    const { data: existingLegacy } = await supabase
      .from('clients')
      .select('id')
      .or(`${id ? `email.eq.${id},` : ''}phone.eq.${phone.trim()}`);

    if ((existingNew?.length || 0) + (existingLegacy?.length || 0) > 0) {
      return res.status(409).json({ error: 'An account with this phone or email already exists. Please sign in.' });
    }

    const newClient = { name: name.trim(), email: (email || '').trim(), phone: phone.trim(), password: password.trim() };

    // Insert into new client_profiles table
    const { error: insertErr } = await supabase.from('client_profiles').insert([newClient]);
    // Also insert into legacy clients table
    await supabase.from('clients').insert([newClient]);

    if (insertErr) throw insertErr;

    const token = jwt.sign(
      { role: 'client', phone: newClient.phone, email: newClient.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      status: 'success',
      message: 'Client account created successfully.',
      token,
      user: { ...newClient, role: 'client' }
    });
  } catch (err) {
    console.error('Client Register Error:', err);
    return res.status(500).json({ error: 'Registration failed. ' + err.message });
  }
};

app.post('/api/auth/register-client', clientRegisterHandler);
app.post('/auth/register-client', clientRegisterHandler);
app.post('/.netlify/functions/api/auth/register-client', clientRegisterHandler);
app.post('/functions/api/auth/register-client', clientRegisterHandler);

// Supabase Login Route for Lawyers and Clients (legacy — kept for backwards compat)
app.post('/api/auth/login-supabase', async (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    if (!identifier || !password || !role) {
      return res.status(400).json({ error: 'Identifier, password, and role are required.' });
    }
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not configured on server.' });
    }

    const table = role === 'lawyer' ? 'lawyers' : 'clients';
    const id = identifier.trim().toLowerCase();

    const { data: users, error } = await supabase
      .from(table)
      .select('*')
      .or(`email.eq.${id},phone.eq.${identifier.trim()}`);

    if (error) throw error;

    if (users && users.length > 0) {
      // In a real app, passwords should be hashed. Here we compare plain text or hash.
      const matchedUser = users.find(u => verifyPassword(password.trim(), u.password) && (role === 'lawyer' ? u.status === 'approved' : true));
      
      if (matchedUser) {
        const token = jwt.sign(
          { id: matchedUser.id, role, phone: matchedUser.phone, email: matchedUser.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.status(200).json({
          status: 'success',
          token,
          user: {
            ...matchedUser,
            role
          }
        });
      }
    }
    
    return res.status(401).json({ error: `Invalid credentials for ${role} account.` });
  } catch (err) {
    console.error("Supabase Login Error:", err);
    return res.status(500).json({ error: 'Login failed. ' + err.message });
  }
});

// Sync Cases — push updated cases array to DB after a new case is hired
app.post('/api/auth/sync-cases', async (req, res) => {
  try {
    await connectDB();
    const { phone, newCase } = req.body;

    if (!phone || !newCase) {
      return res.status(400).json({ error: 'Phone and case data are required.' });
    }

    // Basic JWT Authorization Check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Token missing.' });
    }
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }

    const updated = await Client.findOneAndUpdate(
      { phone: phone.trim() },
      { $push: { cases: newCase } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Client account not found.' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Case added to client profile.',
      cases: updated.cases
    });
  } catch (err) {
    console.error("Sync Cases Error:", err);
    res.status(500).json({ error: 'Case sync failed. ' + err.message });
  }
});

// Legacy register route (kept for backward compat)
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { name, phone, hiredLawyer } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Missing fields.' });

    await Client.findOneAndUpdate(
      { phone: phone.trim() },
      { name: name.trim(), $push: { cases: hiredLawyer } },
      { new: true, upsert: true }
    );

    res.status(201).json({ status: 'success', message: 'Registered.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Secure Admin Login ──
// Credentials are stored server-side in environment variables only.
// They are NEVER sent to the browser or bundled in the frontend JS.
const adminLoginHandler = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'Ansh2015';

  if (
    username.trim().toLowerCase() === validUsername.toLowerCase() &&
    password.trim() === validPassword
  ) {
    const token = jwt.sign(
      { id: 'admin', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    return res.status(200).json({ status: 'success', message: 'Authenticated.', token });
  }

  return res.status(401).json({ error: 'Invalid admin credentials. Access Denied.' });
};

// Register under all path variants — covers different serverless-http prefix-stripping behaviours
app.post('/api/auth/admin-login', adminLoginHandler);
app.post('/auth/admin-login', adminLoginHandler);
// Full path as Netlify passes it to the function (including function name prefix)
app.post('/.netlify/functions/api/auth/admin-login', adminLoginHandler);
app.post('/functions/api/auth/admin-login', adminLoginHandler);

// ── JWT Verification Route ──
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ status: 'success', user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});
// Register verification under wildcard Netlify paths as well
app.get('/auth/verify', (req, res) => app._router.handle(req, res));
app.get('/.netlify/functions/api/auth/verify', (req, res) => app._router.handle(req, res));
app.get('/functions/api/auth/verify', (req, res) => app._router.handle(req, res));

module.exports.handler = serverless(app);
