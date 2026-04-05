// Admin password reset script
// Usage: node reset_admin.js <new_password>
// Example: node reset_admin.js MySecurePassword123!

require('dotenv').config();
const db = require('./src/config/db');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const PEPPER = process.env.PEPPER_SECRET;
const SALT_ROUNDS = 12;

async function resetAdmin() {
  const email = 'batuhan.ersan81@gmail.com';
  const username = 'batu';
  
  // Get password from command line argument, or generate a random one
  let password = process.argv[2];
  let wasGenerated = false;
  
  if (!password) {
    password = crypto.randomBytes(16).toString('hex');
    wasGenerated = true;
    console.log('⚠️  No password provided. Generating a random one...');
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters long!');
    process.exit(1);
  }
  
  console.log('=== Admin Password Reset ===');
  console.log('PEPPER_SECRET loaded:', PEPPER ? 'YES' : 'NO - UNDEFINED!');
  
  if (!PEPPER) {
    console.error('ERROR: PEPPER_SECRET is not defined in .env file!');
    process.exit(1);
  }

  try {
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
      
      const pepperedPassword = password + PEPPER;
      const newHash = await bcryptjs.hash(pepperedPassword, SALT_ROUNDS);
      
      await db.query(
        'UPDATE users SET password_hash = ?, role = ? WHERE email = ?',
        [newHash, 'admin', email]
      );
      
      console.log('✅ Password and role updated!');
      
      const isValid = await bcryptjs.compare(pepperedPassword, newHash);
      console.log('Password verification:', isValid ? '✅ PASSED' : '❌ FAILED');
    }

    if (wasGenerated) {
      console.log(`\n🔑 Generated password: ${password}`);
      console.log('⚠️  Save this password immediately! It will not be shown again.');
    } else {
      console.log('\n✅ Password has been set to the value you provided.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
