const db = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/security');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { logSecurityEvent } = require('../utils/logger');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }
    
    // Check if user exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password with Salt + Pepper
    const hashedPassword = await hashPassword(password);

    // Insert user (Default role: user)
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user']
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Register Error:', error.message, error.stack);
    
    // More specific error messages
    if (error.message && error.message.includes('PEPPER_SECRET')) {
      return res.status(500).json({ message: 'Server configuration error: Missing PEPPER_SECRET' });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      logSecurityEvent('LOGIN_FAIL', req, { email, reason: 'User not found' }).catch(() => {});
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      logSecurityEvent('LOGIN_FAIL', req, { email, reason: 'Invalid password' }).catch(() => {});
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2FA Check
    if (user.two_factor_enabled) {
      if (!twoFactorCode) {
        return res.status(200).json({ 
          require2FA: true, 
          message: 'Please enter your 2FA code' 
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: twoFactorCode
      });

      if (!verified) {
        logSecurityEvent('LOGIN_FAIL_2FA', req, { email, reason: 'Invalid 2FA code' }).catch(() => {});
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        two_factor_enabled: user.two_factor_enabled
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message, error.code, error.sqlMessage || '');
    
    // Database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ message: 'Database table not found. Please run migrations.' });
    }
    
    res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `Teskilat (${req.user.username})` });
    
    // Save secret temporarily (or permanently but disabled)
    await db.query('UPDATE users SET two_factor_secret = ? WHERE id = ?', [secret.base32, req.user.id]);

    // Generate QR Code
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ message: 'Error generating QR code' });
      res.json({ secret: secret.base32, qrCode: data_url });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const [users] = await db.query('SELECT two_factor_secret FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token
    });

    if (verified) {
      await db.query('UPDATE users SET two_factor_enabled = TRUE WHERE id = ?', [req.user.id]);
      res.json({ message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
