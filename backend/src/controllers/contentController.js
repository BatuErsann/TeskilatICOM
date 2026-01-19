const db = require('../config/db');

// Helper function to fetch video thumbnail from various platforms
async function getVideoThumbnail(media_url, platform) {
  if (!media_url || !platform) return null;

  try {
    // Node.js 18+ için global fetch, eski sürümler için fallback
    const fetchFunc = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
    
    switch (platform) {
      case 'youtube': {
        const match = media_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
        const videoId = match ? match[1] : null;
        return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
      }
      
      case 'vimeo': {
        const match = media_url.match(/vimeo\.com\/(\d+)/);
        const videoId = match ? match[1] : null;
        if (videoId) {
          try {
            const response = await fetchFunc(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
            const data = await response.json();
            return data.thumbnail_url || `https://vumbnail.com/${videoId}.jpg`;
          } catch {
            return `https://vumbnail.com/${videoId}.jpg`;
          }
        }
        return null;
      }
      
      case 'tiktok': {
        try {
          const response = await fetchFunc(`https://www.tiktok.com/oembed?url=${encodeURIComponent(media_url)}`);
          const data = await response.json();
          return data.thumbnail_url || null;
        } catch {
          return null;
        }
      }
      
      case 'instagram': {
        try {
          // Instagram oembed API (public postlar için)
          const response = await fetchFunc(`https://api.instagram.com/oembed/?url=${encodeURIComponent(media_url)}`);
          const data = await response.json();
          return data.thumbnail_url || null;
        } catch (err1) {
          try {
            // Alternatif: Facebook Graph API
            const response = await fetchFunc(`https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(media_url)}&access_token=`);
            const data = await response.json();
            return data.thumbnail_url || null;
          } catch (err2) {
            console.log('Instagram thumbnail fetch failed, using placeholder');
            return null;
          }
        }
      }
      
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error fetching thumbnail for ${platform}:`, error.message);
    return null;
  }
}

// Get Hero Image
exports.getHeroImage = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['hero_image']);
    if (rows.length > 0) {
      res.json({ url: rows[0].setting_value });
    } else {
      res.json({ url: '' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Update Hero Image (Admin only)
exports.updateHeroImage = async (req, res) => {
  const { url } = req.body;
  try {
    // Check if exists
    const [check] = await db.execute('SELECT * FROM site_settings WHERE setting_key = ?', ['hero_image']);
    if (check.length > 0) {
      await db.execute('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [url, 'hero_image']);
    } else {
      await db.execute('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['hero_image', url]);
    }
    res.json({ message: 'Hero image updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Get All Videos
exports.getVideos = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Add Video (Admin only)
exports.addVideo = async (req, res) => {
  const { video_url, platform, title } = req.body;
  try {
    await db.execute('INSERT INTO videos (video_url, platform, title) VALUES (?, ?, ?)', [video_url, platform || 'youtube', title]);
    res.status(201).json({ message: 'Video added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Delete Video (Admin only)
exports.deleteVideo = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM videos WHERE id = ?', [id]);
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==================== WORKS API ====================

// Get All Works
exports.getWorks = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM works ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Get Single Work
exports.getWorkById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM works WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Work not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Add Work (Admin only)
exports.addWork = async (req, res) => {
  const { title, description, media_type, media_url, video_platform, thumbnail_url, link_url, instagram_url, linkedin_url, youtube_url, category } = req.body;
  try {
    let finalThumbnail = thumbnail_url;
    
    // Eğer video ve thumbnail yoksa otomatik al
    if (media_type === 'video' && !thumbnail_url && video_platform) {
      finalThumbnail = await getVideoThumbnail(media_url, video_platform);
    }
    
    const [result] = await db.execute(
      'INSERT INTO works (title, description, media_type, media_url, video_platform, thumbnail_url, link_url, instagram_url, linkedin_url, youtube_url, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, media_type, media_url, video_platform || 'youtube', finalThumbnail || null, link_url || null, instagram_url || null, linkedin_url || null, youtube_url || null, category || null]
    );
    res.status(201).json({ message: 'Work added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Update Work (Admin only)
exports.updateWork = async (req, res) => {
  const { id } = req.params;
  const { title, description, media_type, media_url, video_platform, thumbnail_url, link_url, instagram_url, linkedin_url, youtube_url, category } = req.body;
  try {
    let finalThumbnail = thumbnail_url;
    
    // Eğer video ve thumbnail yoksa otomatik al
    if (media_type === 'video' && !thumbnail_url && video_platform) {
      finalThumbnail = await getVideoThumbnail(media_url, video_platform);
    }
    
    await db.execute(
      'UPDATE works SET title = ?, description = ?, media_type = ?, media_url = ?, video_platform = ?, thumbnail_url = ?, link_url = ?, instagram_url = ?, linkedin_url = ?, youtube_url = ?, category = ? WHERE id = ?',
      [title, description, media_type, media_url, video_platform || 'youtube', finalThumbnail || null, link_url || null, instagram_url || null, linkedin_url || null, youtube_url || null, category || null, id]
    );
    res.json({ message: 'Work updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Delete Work (Admin only)
exports.deleteWork = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM works WHERE id = ?', [id]);
    res.json({ message: 'Work deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Get Featured Works (for Home page)
exports.getFeaturedWorks = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM works WHERE is_featured = TRUE ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Toggle Featured Status (Admin only)
exports.toggleFeatured = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE works SET is_featured = NOT is_featured WHERE id = ?', [id]);
    const [rows] = await db.execute('SELECT is_featured FROM works WHERE id = ?', [id]);
    res.json({ message: 'Featured status toggled', is_featured: rows[0]?.is_featured });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Get Works Layout
exports.getWorksLayout = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM works_layout ORDER BY id DESC LIMIT 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ id: null, layout_data: '[]' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Save Works Layout (Admin only)
exports.saveWorksLayout = async (req, res) => {
  const { layout_data } = req.body;
  try {
    // Check if layout exists
    const [check] = await db.execute('SELECT * FROM works_layout ORDER BY id DESC LIMIT 1');
    
    if (check.length > 0) {
      await db.execute('UPDATE works_layout SET layout_data = ? WHERE id = ?', [JSON.stringify(layout_data), check[0].id]);
    } else {
      await db.execute('INSERT INTO works_layout (layout_data) VALUES (?)', [JSON.stringify(layout_data)]);
    }
    res.json({ message: 'Layout saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Get Featured Works Layout
exports.getFeaturedWorksLayout = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM works_layout WHERE layout_type = 'featured' ORDER BY id DESC LIMIT 1");
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ id: null, layout_data: '[]', layout_type: 'featured' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Save Featured Works Layout (Admin only)
exports.saveFeaturedWorksLayout = async (req, res) => {
  const { layout_data } = req.body;
  try {
    // Check if featured layout exists
    const [check] = await db.execute("SELECT * FROM works_layout WHERE layout_type = 'featured' ORDER BY id DESC LIMIT 1");
    
    if (check.length > 0) {
      await db.execute('UPDATE works_layout SET layout_data = ? WHERE id = ?', [JSON.stringify(layout_data), check[0].id]);
    } else {
      await db.execute("INSERT INTO works_layout (layout_data, layout_type) VALUES (?, 'featured')", [JSON.stringify(layout_data)]);
    }
    res.json({ message: 'Featured layout saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==================== ANNOUNCEMENTS API ====================

// Get Active Announcements (for Hero)
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM announcements WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Get All Announcements (Admin)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Get Single Announcement
exports.getAnnouncementById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM announcements WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Add Announcement (Admin only)
exports.addAnnouncement = async (req, res) => {
  const { title, short_description, full_content, image_url, link_url, link_text, is_active, display_order } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO announcements (title, short_description, full_content, image_url, link_url, link_text, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, short_description || null, full_content || null, image_url, link_url || null, link_text || 'Read More', is_active !== false, display_order || 0]
    );
    res.status(201).json({ message: 'Announcement added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Update Announcement (Admin only)
exports.updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, short_description, full_content, image_url, link_url, link_text, is_active, display_order } = req.body;
  try {
    await db.execute(
      'UPDATE announcements SET title = ?, short_description = ?, full_content = ?, image_url = ?, link_url = ?, link_text = ?, is_active = ?, display_order = ? WHERE id = ?',
      [title, short_description || null, full_content || null, image_url, link_url || null, link_text || 'Read More', is_active !== false, display_order || 0, id]
    );
    res.json({ message: 'Announcement updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Delete Announcement (Admin only)
exports.deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Toggle Announcement Active Status (Admin only)
exports.toggleAnnouncementStatus = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE announcements SET is_active = NOT is_active WHERE id = ?', [id]);
    res.json({ message: 'Status toggled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==================== TEAM MEMBERS API ====================

// Get All Team Members (Public)
exports.getTeamMembers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM team_members ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Get Single Team Member
exports.getTeamMemberById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM team_members WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Team member not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Add Team Member (Admin only)
exports.addTeamMember = async (req, res) => {
  const { name, surname, title, image_url, linkedin_url, display_order } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO team_members (name, surname, title, image_url, linkedin_url, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [name, surname, title || null, image_url || null, linkedin_url || null, display_order || 0]
    );
    res.status(201).json({ message: 'Team member added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Update Team Member (Admin only)
exports.updateTeamMember = async (req, res) => {
  const { id } = req.params;
  const { name, surname, title, image_url, linkedin_url, display_order } = req.body;
  try {
    await db.execute(
      'UPDATE team_members SET name = ?, surname = ?, title = ?, image_url = ?, linkedin_url = ?, display_order = ? WHERE id = ?',
      [name, surname, title || null, image_url || null, linkedin_url || null, display_order || 0, id]
    );
    res.json({ message: 'Team member updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// Delete Team Member (Admin only)
exports.deleteTeamMember = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM team_members WHERE id = ?', [id]);
    res.json({ message: 'Team member deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==================== SERVICES API ====================

exports.getServices = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM services ORDER BY display_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

exports.addService = async (req, res) => {
  const { title, description, icon, display_order } = req.body;
  try {
    await db.execute(
      'INSERT INTO services (title, description, icon, display_order) VALUES (?, ?, ?, ?)',
      [title, description, icon, display_order || 0]
    );
    res.status(201).json({ message: 'Service added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { title, description, icon, display_order } = req.body;
  try {
    await db.execute(
      'UPDATE services SET title = ?, description = ?, icon = ?, display_order = ? WHERE id = ?',
      [title, description, icon, display_order, id]
    );
    res.json({ message: 'Service updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM services WHERE id = ?', [id]);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==================== SITE CONTENT API ====================

exports.getAllContent = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM site_contents');
    // Convert to object for easier frontend usage: { key: value }
    const contentMap = {};
    rows.forEach(row => {
      contentMap[row.content_key] = row.content_value;
    });
    res.json(contentMap);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

exports.updateContent = async (req, res) => {
  // Expecting { key, value, page, section } or array of them
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    
    for (const item of items) {
        if (item.key && item.value !== undefined) {
            await db.execute(
                'INSERT INTO site_contents (content_key, content_value, page_name, section_name) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE content_value = ?',
                [item.key, item.value, item.page || 'general', item.section || 'general', item.value]
            );
        }
    }
    res.json({ message: 'Content updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};
