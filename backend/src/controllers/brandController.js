const db = require('../config/db');

// Public fields only
const PUBLIC_BRAND_FIELDS = ['id', 'name', 'logo_url', 'display_order'];

function filterPublicFields(rows) {
  return rows.map(row => {
    const filtered = {};
    for (const field of PUBLIC_BRAND_FIELDS) {
      if (row[field] !== undefined) {
        filtered[field] = row[field];
      }
    }
    return filtered;
  });
}

// Get All Brands — Public (filtered)
exports.getAllBrands = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM brands ORDER BY display_order ASC, created_at DESC');
    res.json(filterPublicFields(rows));
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Get All Brands — Admin (all fields)
exports.getAllBrandsAdmin = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM brands ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
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
    res.status(500).json({ message: 'Database error' });
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
    res.status(500).json({ message: 'Database error' });
  }
};

// Delete Brand
exports.deleteBrand = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM brands WHERE id = ?', [id]);
    res.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};
