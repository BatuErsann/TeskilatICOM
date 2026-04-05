const db = require('../config/db');

const logSecurityEvent = async (eventType, req, details = '') => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await db.query(
      'INSERT INTO security_logs (event_type, ip_address, user_agent, details) VALUES (?, ?, ?, ?)',
      [eventType, ip, userAgent, typeof details === 'object' ? JSON.stringify(details) : details]
    );
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
};

const logAdminAction = async (userId, actionText) => {
  try {
    if (!userId || !actionText) return;
    await db.query(
      'INSERT INTO admin_action_logs (user_id, action_text) VALUES (?, ?)',
      [userId, actionText]
    );
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
};

module.exports = { logSecurityEvent, logAdminAction };
