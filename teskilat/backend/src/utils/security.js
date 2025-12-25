const bcrypt = require('bcrypt');
require('dotenv').config();

const PEPPER = process.env.PEPPER_SECRET;
const SALT_ROUNDS = 12;

/**
 * Hashes a password using Salt + Pepper + Bcrypt
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
exports.hashPassword = async (password) => {
  if (!password) throw new Error('Password is required');
  const pepperedPassword = password + PEPPER;
  const hash = await bcrypt.hash(pepperedPassword, SALT_ROUNDS);
  return hash;
};

/**
 * Verifies a password against a hash
 * @param {string} password - The plain text password
 * @param {string} hash - The stored hash
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
exports.verifyPassword = async (password, hash) => {
  if (!password || !hash) return false;
  const pepperedPassword = password + PEPPER;
  return await bcrypt.compare(pepperedPassword, hash);
};
