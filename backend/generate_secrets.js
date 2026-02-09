const crypto = require('crypto');

// Function to generate a secure random hex string
const generateSecret = (length = 64) => {
    // defaults to 64 bytes (128 hex characters) for high security
    return crypto.randomBytes(length).toString('hex');
};

const jwtSecret = generateSecret();
const pepperSecret = generateSecret();

console.log('\n==================================================');
console.log('   GENERATED SECURE SECRETS');
console.log('==================================================\n');

console.log('JWT_SECRET=' + jwtSecret);
console.log('\nPEPPER_SECRET=' + pepperSecret);

console.log('\n==================================================');
console.log('Instructions:');
console.log('1. Copy the values above.');
console.log('2. Paste them into your .env file, replacing the existing placeholder values.');
console.log('==================================================\n');
