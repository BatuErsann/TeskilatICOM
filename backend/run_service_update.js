const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updateDatabase() {
    console.log('🚀 Starting service update...\n');

    let connection;
    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'teskilat_db',
            multipleStatements: true
        });

        console.log('✓ Connected to database');

        // Read and execute SQL file
        const sqlFilePath = path.join(__dirname, 'update_services_final.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('✓ SQL file loaded');
        console.log('⏳ Executing updates...\n');
        
        await connection.query(sql);
        console.log('✅ Services updated successfully!');

    } catch (error) {
        console.error('❌ Update failed:', error.message);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

updateDatabase();
