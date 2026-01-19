const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
    try {
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
        // Add more stats here as needed
        res.json({
            totalUsers: userCount[0].count,
            serverTime: new Date()
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
