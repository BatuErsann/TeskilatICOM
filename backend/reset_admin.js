// Test script to reset admin password
// Run with: node reset_admin.js

require('dotenv').config();
const db = require('./src/config/db');
const bcryptjs = require('bcryptjs');

const PEPPER = process.env.PEPPER_SECRET;
const SALT_ROUNDS = 12;

async function resetAdmin() {
  const email = 'batuhan.ersan81@gmail.com';
  const username = 'batu';
  const password = 'adminadmin';
  
  console.log('=== Password Reset Script ===');
  console.log('PEPPER_SECRET loaded:', PEPPER ? 'YES (' + PEPPER.substring(0, 10) + '...)' : 'NO - UNDEFINED!');
  
  if (!PEPPER) {
    console.error('ERROR: PEPPER_SECRET is not defined in .env file!');
    process.exit(1);
  }

  try {
    // Check all users
    const [allUsers] = await db.query('SELECT id, username, email, role FROM users');
    console.log('All users in database:', allUsers);
    
    // Check if user exists by email OR username
    const [users] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    
    if (users.length === 0) {
      console.log('User not found. Creating new admin...');
      const pepperedPassword = password + PEPPER;
      const hashedPassword = await bcryptjs.hash(pepperedPassword, SALT_ROUNDS);
      
      await db.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 'admin']
      );
      console.log('✅ Admin created successfully!');
    } else {
      console.log('User found. ID:', users[0].id, 'Role:', users[0].role);
      console.log('Current hash:', users[0].password_hash.substring(0, 20) + '...');
      
      // Create new hash
      const pepperedPassword = password + PEPPER;
      const newHash = await bcryptjs.hash(pepperedPassword, SALT_ROUNDS);
      
      console.log('New hash:', newHash.substring(0, 20) + '...');
      
      // Update password and role
      await db.query(
        'UPDATE users SET password_hash = ?, role = ? WHERE email = ?',
        [newHash, 'admin', email]
      );
      
      console.log('✅ Password and role updated!');
      
      // Verify the password works
      const isValid = await bcryptjs.compare(pepperedPassword, newHash);
      console.log('Password verification test:', isValid ? '✅ PASSED' : '❌ FAILED');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
