const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

// ==================== PUBLIC ROUTES (filtered fields) ====================

router.get('/hero', contentController.getHeroImage);
router.get('/about/background', contentController.getAboutBackground);
router.get('/about/overlay-opacity', contentController.getAboutOverlayOpacity);
router.get('/videos', contentController.getVideos);

// Works Public Routes - Specific routes first!
router.get('/works/layout', contentController.getWorksLayout);
router.get('/works/layout/featured', contentController.getFeaturedWorksLayout);
router.get('/works/featured', contentController.getFeaturedWorks);
router.get('/works', contentController.getWorks);
router.get('/works/:id', contentController.getWorkById);

// Announcements Public Routes (only active, filtered fields)
router.get('/announcements/active', contentController.getActiveAnnouncements);
router.get('/announcements/:id', contentController.getAnnouncementById);

// Team Public Routes (filtered fields)
router.get('/team', contentController.getTeamMembers);
router.get('/team/:id', contentController.getTeamMemberById);

// Services Public (filtered fields)
router.get('/services', contentController.getServices);

// Site Content Public
router.get('/site-content', contentController.getAllContent);

// ==================== ADMIN ROUTES (all fields, protected) ====================

router.put('/hero', verifyAdmin, contentController.updateHeroImage);
router.put('/about/background', verifyAdmin, contentController.updateAboutBackground);
router.put('/about/overlay-opacity', verifyAdmin, contentController.updateAboutOverlayOpacity);
router.post('/videos', verifyAdmin, contentController.addVideo);
router.delete('/videos/:id', verifyAdmin, contentController.deleteVideo);

// Works Admin Routes — includes full-data list for admin panel
router.get('/admin/works', verifyAdmin, contentController.getWorksAdmin);
router.post('/works', verifyAdmin, contentController.addWork);
router.put('/works/layout', verifyAdmin, contentController.saveWorksLayout);
router.put('/works/layout/featured', verifyAdmin, contentController.saveFeaturedWorksLayout);
router.put('/works/:id/featured', verifyAdmin, contentController.toggleFeatured);
router.put('/works/:id', verifyAdmin, contentController.updateWork);
router.delete('/works/:id', verifyAdmin, contentController.deleteWork);

// Announcements Admin Routes — includes all-status list + admin single fetch
router.get('/announcements', verifyAdmin, contentController.getAllAnnouncements);
router.get('/admin/announcements/:id', verifyAdmin, contentController.getAnnouncementByIdAdmin);
router.post('/announcements', verifyAdmin, contentController.addAnnouncement);
router.put('/announcements/:id', verifyAdmin, contentController.updateAnnouncement);
router.put('/announcements/:id/toggle', verifyAdmin, contentController.toggleAnnouncementStatus);
router.delete('/announcements/:id', verifyAdmin, contentController.deleteAnnouncement);

// Team Admin Routes — includes full-data list
router.get('/admin/team', verifyAdmin, contentController.getTeamMembersAdmin);
router.post('/team', verifyAdmin, contentController.addTeamMember);
router.put('/team/:id', verifyAdmin, contentController.updateTeamMember);
router.delete('/team/:id', verifyAdmin, contentController.deleteTeamMember);

// Services Admin Routes — includes full-data list
router.get('/admin/services', verifyAdmin, contentController.getServicesAdmin);
router.post('/services', verifyAdmin, contentController.addService);
router.put('/services/:id', verifyAdmin, contentController.updateService);
router.delete('/services/:id', verifyAdmin, contentController.deleteService);

// Site Content Admin
router.post('/site-content', verifyAdmin, contentController.updateContent);

module.exports = router;
