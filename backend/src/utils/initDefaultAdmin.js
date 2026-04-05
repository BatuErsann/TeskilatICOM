/**
 * No-op — admin users are managed manually by existing admins.
 * Kept for backward compatibility with app.js import.
 */
async function initDefaultAdmin() {
  // Nothing to do
}

module.exports = { initDefaultAdmin };
