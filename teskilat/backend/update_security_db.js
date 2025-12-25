const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'teskilat_db',
};

async function updateDB() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    // 1. Add 2FA columns to users table
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN two_factor_secret VARCHAR(100) NULL,
        ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
      `);
      console.log('Added 2FA columns to users table.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('2FA columns already exist.');
      } else {
        console.error('Error adding 2FA columns:', err.message);
      }
    }

    // 2. Create security_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL, -- 'LOGIN_FAIL', 'UNAUTHORIZED_ACCESS', 'BRUTE_FORCE'
        ip_address VARCHAR(45),
        user_agent TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created security_logs table.');

  } catch (error) {
    console.error('Database update failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

updateDB();
