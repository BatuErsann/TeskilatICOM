// Script to clear all services from database
const db = require('./src/config/db');

async function clearServices() {
    try {
        console.log('Clearing services from database...');

        const [result] = await db.execute('TRUNCATE TABLE services');

        console.log('✅ All services have been deleted successfully!');
        console.log('Services table is now empty.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing services:', error.message);
        process.exit(1);
    }
}

clearServices();
