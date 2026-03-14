const db = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/security');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const { logSecurityEvent } = require('../utils/logger');
const sendEmail = require('../utils/email');

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
      logSecurityEvent('LOGIN_FAIL', req, { email, reason: 'User not found' }).catch(() => { });
      
      let warningMessage = null;
      if (req.rateLimit) {
        const limit = req.rateLimit.limit;
        const current = req.rateLimit.current;
        const remaining = limit - current; // current includes this request

        if (remaining <= 2 && remaining >= 0) {
          warningMessage = `KRİTİK GÜVENLİK UYARISI: Hesabınızda algılanan şüpheli işlem trafiği nedeniyle son ${remaining} giriş hakkınız kalmıştır. Hakkınızın dolması durumunda IP adresiniz 'Süresiz Erişim Engeli' (Perma-Ban) listesine alınacaktır. Erişim sorunu yaşamamak için lütfen geliştirici ile iletişime geçiniz.`;
        }
      }

      return res.status(401).json({ 
        message: 'Invalid credentials',
        warning: warningMessage
      });
    }

    const user = users[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      logSecurityEvent('LOGIN_FAIL', req, { email, reason: 'Invalid password' }).catch(() => { });
      
      let warningMessage = null;
      if (req.rateLimit) {
        const limit = req.rateLimit.limit;
        const current = req.rateLimit.current;
        const remaining = limit - current; // current includes this request

        if (remaining <= 2 && remaining >= 0) {
          warningMessage = `KRİTİK GÜVENLİK UYARISI: Hesabınızda algılanan şüpheli işlem trafiği nedeniyle son ${remaining} giriş hakkınız kalmıştır. Hakkınızın dolması durumunda IP adresiniz 'Süresiz Erişim Engeli' (Perma-Ban) listesine alınacaktır. Erişim sorunu yaşamamak için lütfen geliştirici ile iletişime geçiniz.`;
        }
      }

      return res.status(401).json({ 
        message: 'Invalid credentials',
        warning: warningMessage
      });
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
        logSecurityEvent('LOGIN_FAIL_2FA', req, { email, reason: 'Invalid 2FA code' }).catch(() => { });
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

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isValid = await verifyPassword(currentPassword, users[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password Change Error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

// ==================== FORGOT PASSWORD (Code-Based) ====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const [users] = await db.query('SELECT id, email, username FROM users WHERE email = ?', [email]);

    // Always return success (prevent user enumeration)
    if (users.length === 0) {
      return res.json({ message: 'Eğer bu e-posta kayıtlıysa, doğrulama kodu gönderildi.' });
    }

    const user = users[0];

    // Invalidate any existing tokens for this user
    await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE', [user.id]);

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(resetCode).digest('hex');

    // Store hashed code with 15 min expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, codeHash, expiresAt]
    );

    // Send email with code
    await sendEmail({
      email: user.email,
      subject: 'Teskilat - Şifre Sıfırlama Kodu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e2b714; margin: 0; font-size: 28px;">TEŞKILAT</h1>
            <p style="color: #888; margin-top: 5px;">Şifre Sıfırlama</p>
          </div>
          <p style="color: #ccc; font-size: 16px; line-height: 1.6;">Merhaba <strong style="color: #fff;">${user.username}</strong>,</p>
          <p style="color: #ccc; font-size: 16px; line-height: 1.6;">Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #16213e; border: 2px solid #e2b714; border-radius: 12px; padding: 20px 40px; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #e2b714;">${resetCode}</span>
            </div>
          </div>
          <p style="color: #888; font-size: 14px; line-height: 1.6;">Bu kod <strong>15 dakika</strong> geçerlidir. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
          <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">Bu e-posta Teskilat tarafından otomatik olarak gönderilmiştir.</p>
        </div>
      `,
      message: `Şifre sıfırlama kodunuz: ${resetCode} (15 dakika geçerlidir)`
    });

    logSecurityEvent('PASSWORD_RESET_REQUESTED', req, { email }).catch(() => { });

    res.json({ message: 'Eğer bu e-posta kayıtlıysa, doğrulama kodu gönderildi.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== RESET PASSWORD (Code-Based) ====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş kod' });
    }

    const user = users[0];

    // Hash the provided code to compare with DB
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    // Find valid token for this user
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE user_id = ? AND token_hash = ? AND used = FALSE AND expires_at > NOW()',
      [user.id, codeHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş kod' });
    }

    const resetToken = tokens[0];

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);

    // Mark token as used
    await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = ?', [resetToken.id]);

    logSecurityEvent('PASSWORD_RESET_SUCCESS', req, { userId: user.id }).catch(() => { });

    res.json({ message: 'Şifreniz başarıyla güncellendi' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
