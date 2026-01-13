// Quick Database Update Script for Teşkilat Website
// Run this file with: node update_database.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updateDatabase() {
    console.log('🚀 Starting database update...\n');

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
        const sqlFilePath = path.join(__dirname, 'database_update_content.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('✓ SQL file loaded');
        console.log('⏳ Executing updates...\n');

        // Split by semicolons and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }

        console.log('\n✅ Database updated successfully!\n');
        console.log('📋 Changes applied:');
        console.log('   • Services updated (12 services)');
        console.log('   • WWF GIGI Awards announcement added');
        console.log('\n💡 Next steps:');
        console.log('   1. Upload award image (optional)');
        console.log('   2. Restart backend server');
        console.log('   3. Verify changes on website');
        console.log('\n📝 See CONTENT_UPDATE_README.md for details\n');

    } catch (error) {
        console.error('\n❌ Error updating database:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   • Check database credentials in .env file');
        console.error('   • Ensure MySQL server is running');
        console.error('   • Verify database "teskilat_db" exists\n');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed.\n');
        }
    }
}

// Run the update
updateDatabase();
