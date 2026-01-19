const db = require('../config/db');

// Get All Brands
exports.getAllBrands = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM brands ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Add Brand
exports.addBrand = async (req, res) => {
  const { name, logo_url, display_order } = req.body;
  try {
    await db.execute(
      'INSERT INTO brands (name, logo_url, display_order) VALUES (?, ?, ?)', 
      [name, logo_url, display_order || 0]
    );
    res.status(201).json({ message: 'Brand added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Update Brand
exports.updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name, logo_url, display_order } = req.body;
  try {
    await db.execute(
      'UPDATE brands SET name = ?, logo_url = ?, display_order = ? WHERE id = ?', 
      [name, logo_url, display_order, id]
    );
    res.json({ message: 'Brand updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Delete Brand
exports.deleteBrand = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM brands WHERE id = ?', [id]);
    res.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};
