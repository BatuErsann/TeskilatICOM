const db = require('../config/db');

// ==================== URL VALIDATION ====================

/**
 * Whitelist of allowed video/media URL domains.
 * Prevents arbitrary URLs from being stored.
 */
const ALLOWED_VIDEO_DOMAINS = [
  'youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com',
  'vimeo.com', 'www.vimeo.com', 'player.vimeo.com',
  'tiktok.com', 'www.tiktok.com', 'vm.tiktok.com',
  'instagram.com', 'www.instagram.com',
  'facebook.com', 'www.facebook.com', 'fb.watch',
  'twitter.com', 'www.twitter.com', 'x.com'
];

/**
 * Validates that a URL belongs to an allowed video platform.
 * Returns { valid: boolean, reason?: string }
 */
function validateVideoUrl(url) {
  if (!url) return { valid: true }; // Empty URL is OK (optional field)

  try {
    const parsed = new URL(url);

    // Must be HTTPS or HTTP
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return { valid: false, reason: 'URL must use http or https protocol' };
    }

    // Check domain against whitelist
    const hostname = parsed.hostname.toLowerCase();
    const isAllowed = ALLOWED_VIDEO_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );

    if (!isAllowed) {
      return { valid: false, reason: `Domain '${hostname}' is not an allowed video platform. Allowed: YouTube, Vimeo, TikTok, Instagram, Facebook, Twitter/X` };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

/**
 * Validates that a URL is either empty, a relative path (starts with /), or a valid HTTPS URL.
 * Used for link_url, social media URLs, and image URLs.
 */
function validateGeneralUrl(url) {
  if (!url) return { valid: true };

  // Allow relative paths (for uploaded images)
  if (url.startsWith('/')) return { valid: true };

  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return { valid: false, reason: 'URL must use http or https protocol' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

// ==================== FIELD DEFINITIONS ====================

/**
 * Fields returned to the PUBLIC frontend (no admin-only fields).
 */
const PUBLIC_FIELDS = {
  works: ['id', 'title', 'description', 'media_type', 'media_url', 'video_platform', 'thumbnail_url', 'link_url', 'instagram_url', 'linkedin_url', 'youtube_url', 'tiktok_url', 'category', 'created_at'],
  services: ['id', 'title', 'description', 'icon', 'display_order'],
  team: ['id', 'name', 'surname', 'title', 'image_url', 'linkedin_url', 'display_order'],
  brands: ['id', 'name', 'logo_url', 'display_order'],
  announcements: ['id', 'title', 'short_description', 'full_content', 'image_url', 'link_url', 'link_text', 'display_order', 'created_at'],
  videos: ['id', 'video_url', 'platform', 'title', 'created_at']
};

/**
 * Filters database rows to only include public fields.
 */
function filterPublicFields(rows, entityType) {
  const fields = PUBLIC_FIELDS[entityType];
  if (!fields) return rows;

  return rows.map(row => {
    const filtered = {};
    for (const field of fields) {
      if (row[field] !== undefined) {
        filtered[field] = row[field];
      }
    }
    return filtered;
  });
}

// Helper function to fetch video thumbnail from various platforms
async function getVideoThumbnail(media_url, platform) {
  if (!media_url || !platform) return null;

  try {
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
          const response = await fetchFunc(`https://api.instagram.com/oembed/?url=${encodeURIComponent(media_url)}`);
          const data = await response.json();
          return data.thumbnail_url || null;
        } catch (err1) {
          try {
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

// ==================== HERO / ABOUT SETTINGS ====================

exports.getHeroImage = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['hero_image']);
    if (rows.length > 0) {
      res.json({ url: rows[0].setting_value });
    } else {
      res.json({ url: '' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.updateHeroImage = async (req, res) => {
  const { url } = req.body;
  try {
    const [check] = await db.execute('SELECT * FROM site_settings WHERE setting_key = ?', ['hero_image']);
    if (check.length > 0) {
      await db.execute('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [url, 'hero_image']);
    } else {
      await db.execute('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['hero_image', url]);
    }
    res.json({ message: 'Hero image updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.getAboutBackground = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['about_bg_image']);
    if (rows.length > 0) {
      res.json({ url: rows[0].setting_value });
    } else {
      res.json({ url: '' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.updateAboutBackground = async (req, res) => {
  const { url } = req.body;
  try {
    const [check] = await db.execute('SELECT * FROM site_settings WHERE setting_key = ?', ['about_bg_image']);
    if (check.length > 0) {
      await db.execute('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [url, 'about_bg_image']);
    } else {
      await db.execute('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['about_bg_image', url]);
    }
    res.json({ message: 'About background updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.getAboutOverlayOpacity = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['about_overlay_opacity']);
    if (rows.length > 0) {
      res.json({ opacity: rows[0].setting_value });
    } else {
      res.json({ opacity: '0.8' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.updateAboutOverlayOpacity = async (req, res) => {
  const { opacity } = req.body;
  try {
    const [check] = await db.execute('SELECT * FROM site_settings WHERE setting_key = ?', ['about_overlay_opacity']);
    if (check.length > 0) {
      await db.execute('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [opacity, 'about_overlay_opacity']);
    } else {
      await db.execute('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['about_overlay_opacity', opacity]);
    }
    res.json({ message: 'About overlay opacity updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// ==================== VIDEOS ====================

// Public: filtered fields
exports.getVideos = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(filterPublicFields(rows, 'videos'));
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Admin: add video with URL validation
exports.addVideo = async (req, res) => {
  const { video_url, platform, title } = req.body;

  // Validate video URL
  const urlCheck = validateVideoUrl(video_url);
  if (!urlCheck.valid) {
    return res.status(400).json({ message: `Geçersiz video URL: ${urlCheck.reason}` });
  }

  try {
    await db.execute('INSERT INTO videos (video_url, platform, title) VALUES (?, ?, ?)', [video_url, platform || 'youtube', title]);
    res.status(201).json({ message: 'Video added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.deleteVideo = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM videos WHERE id = ?', [id]);
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// ==================== WORKS API ====================

// Public: filtered fields only
exports.getWorks = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM works ORDER BY created_at DESC');
    res.json(filterPublicFields(rows, 'works'));
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Admin: all fields for management
exports.getWorksAdmin = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM works ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Public: single work, filtered
exports.getWorkById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM works WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(filterPublicFields(rows, 'works')[0]);
    } else {
      res.status(404).json({ message: 'Work not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Admin: add work with URL validation
exports.addWork = async (req, res) => {
  const { title, description, media_type, media_url, video_platform, thumbnail_url, link_url, instagram_url, linkedin_url, youtube_url, tiktok_url, category } = req.body;

  // Validate media URL if video type
  if (media_type === 'video' && media_url) {
    const urlCheck = validateVideoUrl(media_url);
    if (!urlCheck.valid) {
      return res.status(400).json({ message: `Geçersiz media URL: ${urlCheck.reason}` });
    }
  }

  // Validate other URLs
  const urlsToValidate = { link_url, instagram_url, linkedin_url, youtube_url, tiktok_url, thumbnail_url };
  for (const [key, val] of Object.entries(urlsToValidate)) {
    const check = validateGeneralUrl(val);
    if (!check.valid) {
      return res.status(400).json({ message: `Geçersiz ${key}: ${check.reason}` });
    }
  }

  try {
    let finalThumbnail = thumbnail_url;
    if (media_type === 'video' && !thumbnail_url && video_platform) {
      finalThumbnail = await getVideoThumbnail(media_url, video_platform);
    }

    const [result] = await db.execute(
      'INSERT INTO works (title, description, media_type, media_url, video_platform, thumbnail_url, link_url, instagram_url, linkedin_url, youtube_url, tiktok_url, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, media_type, media_url, video_platform || 'youtube', finalThumbnail || null, link_url || null, instagram_url || null, linkedin_url || null, youtube_url || null, tiktok_url || null, category || null]
    );
    res.status(201).json({ message: 'Work added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Admin: update work with URL validation
exports.updateWork = async (req, res) => {
  const { id } = req.params;
  const { title, description, media_type, media_url, video_platform, thumbnail_url, link_url, instagram_url, linkedin_url, youtube_url, tiktok_url, category } = req.body;

  // Validate media URL if video type
  if (media_type === 'video' && media_url) {
    const urlCheck = validateVideoUrl(media_url);
    if (!urlCheck.valid) {
      return res.status(400).json({ message: `Geçersiz media URL: ${urlCheck.reason}` });
    }
  }

  // Validate other URLs
  const urlsToValidate = { link_url, instagram_url, linkedin_url, youtube_url, tiktok_url, thumbnail_url };
  for (const [key, val] of Object.entries(urlsToValidate)) {
    const check = validateGeneralUrl(val);
    if (!check.valid) {
      return res.status(400).json({ message: `Geçersiz ${key}: ${check.reason}` });
    }
  }

  try {
    let finalThumbnail = thumbnail_url;
    if (media_type === 'video' && !thumbnail_url && video_platform) {
      finalThumbnail = await getVideoThumbnail(media_url, video_platform);
    }

    await db.execute(
      'UPDATE works SET title = ?, description = ?, media_type = ?, media_url = ?, video_platform = ?, thumbnail_url = ?, link_url = ?, instagram_url = ?, linkedin_url = ?, youtube_url = ?, tiktok_url = ?, category = ? WHERE id = ?',
      [title, description, media_type, media_url, video_platform || 'youtube', finalThumbnail || null, link_url || null, instagram_url || null, linkedin_url || null, youtube_url || null, tiktok_url || null, category || null, id]
    );
    res.json({ message: 'Work updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.deleteWork = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM works WHERE id = ?', [id]);
    res.json({ message: 'Work deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Public: featured works, filtered
exports.getFeaturedWorks = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM works WHERE is_featured = TRUE ORDER BY created_at DESC');
    res.json(filterPublicFields(rows, 'works'));
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.toggleFeatured = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE works SET is_featured = NOT is_featured WHERE id = ?', [id]);
    const [rows] = await db.execute('SELECT is_featured FROM works WHERE id = ?', [id]);
    res.json({ message: 'Featured status toggled', is_featured: rows[0]?.is_featured });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.getWorksLayout = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM works_layout WHERE layout_type = 'main' OR layout_type IS NULL ORDER BY id DESC LIMIT 1");
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ id: null, layout_data: '[]' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.saveWorksLayout = async (req, res) => {
  const { layout_data } = req.body;
  try {
    const [check] = await db.execute("SELECT * FROM works_layout WHERE layout_type = 'main' OR layout_type IS NULL ORDER BY id DESC LIMIT 1");
    if (check.length > 0) {
      await db.execute('UPDATE works_layout SET layout_data = ? WHERE id = ?', [JSON.stringify(layout_data), check[0].id]);
    } else {
      await db.execute("INSERT INTO works_layout (layout_data, layout_type) VALUES (?, 'main')", [JSON.stringify(layout_data)]);
    }
    res.json({ message: 'Layout saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.getFeaturedWorksLayout = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM works_layout WHERE layout_type = 'featured' ORDER BY id DESC LIMIT 1");
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ id: null, layout_data: '[]', layout_type: 'featured' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.saveFeaturedWorksLayout = async (req, res) => {
  const { layout_data } = req.body;
  try {
    const [check] = await db.execute("SELECT * FROM works_layout WHERE layout_type = 'featured' ORDER BY id DESC LIMIT 1");
    if (check.length > 0) {
      await db.execute('UPDATE works_layout SET layout_data = ? WHERE id = ?', [JSON.stringify(layout_data), check[0].id]);
    } else {
      await db.execute("INSERT INTO works_layout (layout_data, layout_type) VALUES (?, 'featured')", [JSON.stringify(layout_data)]);
    }
    res.json({ message: 'Featured layout saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// ==================== ANNOUNCEMENTS API ====================

// Public: only ACTIVE announcements, filtered fields
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM announcements WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC');
    res.json(filterPublicFields(rows, 'announcements'));
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Admin: all announcements, all fields
exports.getAllAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Public: single announcement — ONLY if active (IDOR fix)
exports.getAnnouncementById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM announcements WHERE id = ? AND is_active = TRUE', [id]);
    if (rows.length > 0) {
      res.json(filterPublicFields(rows, 'announcements')[0]);
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Admin: get single announcement (any status) for editing
exports.getAnnouncementByIdAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM announcements WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.addAnnouncement = async (req, res) => {
  const { title, short_description, full_content, image_url, link_url, link_text, is_active, display_order } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO announcements (title, short_description, full_content, image_url, link_url, link_text, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, short_description || null, full_content || null, image_url, link_url || null, link_text || 'Read More', is_active !== false, display_order || 0]
    );
    res.status(201).json({ message: 'Announcement added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

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
    res.status(500).json({ message: 'Database error' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.toggleAnnouncementStatus = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE announcements SET is_active = NOT is_active WHERE id = ?', [id]);
    res.json({ message: 'Status toggled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// ==================== TEAM MEMBERS API ====================

// Public: filtered fields
exports.getTeamMembers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM team_members ORDER BY display_order ASC, created_at DESC');
    res.json(filterPublicFields(rows, 'team'));
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Admin: all fields
exports.getTeamMembersAdmin = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM team_members ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.getTeamMemberById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM team_members WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(filterPublicFields(rows, 'team')[0]);
    } else {
      res.status(404).json({ message: 'Team member not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.addTeamMember = async (req, res) => {
  const { name, surname, title, image_url, linkedin_url, display_order } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO team_members (name, surname, title, image_url, linkedin_url, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [name, surname, title || null, image_url || null, linkedin_url || null, display_order || 0]
    );
    res.status(201).json({ message: 'Team member added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

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
    res.status(500).json({ message: 'Database error' });
  }
};

exports.deleteTeamMember = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM team_members WHERE id = ?', [id]);
    res.json({ message: 'Team member deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// ==================== SERVICES API ====================

// Public: filtered fields
exports.getServices = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM services ORDER BY display_order ASC');
    res.json(filterPublicFields(rows, 'services'));
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// Admin: all fields
exports.getServicesAdmin = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM services ORDER BY display_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
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
    res.status(500).json({ message: 'Database error' });
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
    res.status(500).json({ message: 'Database error' });
  }
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM services WHERE id = ?', [id]);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

// ==================== SITE CONTENT API ====================

exports.getAllContent = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM site_contents');
    const contentMap = {};
    rows.forEach(row => {
      contentMap[row.content_key] = row.content_value;
    });
    res.json(contentMap);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

exports.updateContent = async (req, res) => {
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
    res.status(500).json({ message: 'Database error' });
  }
};
