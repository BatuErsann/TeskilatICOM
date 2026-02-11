const db = require('../config/db');
const { hashPassword } = require('./security');

/**
 * Creates default admin user if it doesn't exist
 * Called on application startup
 */
async function initDefaultAdmin() {
  const DEFAULT_ADMIN = {
    username: 'batu',
    email: 'batuhan.ersan81@gmail.com',
    password: 'adminadmin',
    role: 'admin'
  };

  try {
    // Check if admin user already exists
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [DEFAULT_ADMIN.email, DEFAULT_ADMIN.username]
    );

    // Hash the password
    const hashedPassword = await hashPassword(DEFAULT_ADMIN.password);

    if (existing.length > 0) {
      // Update existing user: set role to admin AND reset password
      const user = existing[0];
      await db.query(
        'UPDATE users SET role = ?, password_hash = ? WHERE id = ?', 
        ['admin', hashedPassword, user.id]
      );
      console.log(`✅ Default admin '${DEFAULT_ADMIN.username}' updated (role + password reset)`);
      return;
    }

    // Create new admin user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [DEFAULT_ADMIN.username, DEFAULT_ADMIN.email, hashedPassword, DEFAULT_ADMIN.role]
    );

    console.log(`✅ Default admin created successfully: ${DEFAULT_ADMIN.username} (ID: ${result.insertId})`);
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    // Don't throw - allow app to continue even if admin creation fails
  }
}

module.exports = { initDefaultAdmin };
