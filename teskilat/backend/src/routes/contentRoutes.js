const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

// Public Routes
router.get('/hero', contentController.getHeroImage);
router.get('/videos', contentController.getVideos);

// Works Public Routes - Specific routes first!
router.get('/works/layout', contentController.getWorksLayout);
router.get('/works/layout/featured', contentController.getFeaturedWorksLayout);
router.get('/works/featured', contentController.getFeaturedWorks);
router.get('/works', contentController.getWorks);
router.get('/works/:id', contentController.getWorkById);

// Announcements Public Routes
router.get('/announcements/active', contentController.getActiveAnnouncements);
router.get('/announcements/:id', contentController.getAnnouncementById);

// Team Public Routes
router.get('/team', contentController.getTeamMembers);
router.get('/team/:id', contentController.getTeamMemberById);

// Admin Routes (Protected)
router.put('/hero', verifyAdmin, contentController.updateHeroImage);
router.post('/videos', verifyAdmin, contentController.addVideo);
router.delete('/videos/:id', verifyAdmin, contentController.deleteVideo);

// Works Admin Routes (Protected) - Specific routes first!
router.post('/works', verifyAdmin, contentController.addWork);
router.put('/works/layout', verifyAdmin, contentController.saveWorksLayout);
router.put('/works/layout/featured', verifyAdmin, contentController.saveFeaturedWorksLayout);
router.put('/works/:id/featured', verifyAdmin, contentController.toggleFeatured);
router.put('/works/:id', verifyAdmin, contentController.updateWork);
router.delete('/works/:id', verifyAdmin, contentController.deleteWork);

// Announcements Admin Routes (Protected)
router.get('/announcements', verifyAdmin, contentController.getAllAnnouncements);
router.post('/announcements', verifyAdmin, contentController.addAnnouncement);
router.put('/announcements/:id', verifyAdmin, contentController.updateAnnouncement);
router.put('/announcements/:id/toggle', verifyAdmin, contentController.toggleAnnouncementStatus);
router.delete('/announcements/:id', verifyAdmin, contentController.deleteAnnouncement);

// Team Admin Routes (Protected)
router.post('/team', verifyAdmin, contentController.addTeamMember);
router.put('/team/:id', verifyAdmin, contentController.updateTeamMember);
router.delete('/team/:id', verifyAdmin, contentController.deleteTeamMember);

// Services Routes
router.get('/services', contentController.getServices);
router.post('/services', verifyAdmin, contentController.addService);
router.put('/services/:id', verifyAdmin, contentController.updateService);
router.delete('/services/:id', verifyAdmin, contentController.deleteService);

// Site Content Routes
router.get('/site-content', contentController.getAllContent);
router.post('/site-content', verifyAdmin, contentController.updateContent);

module.exports = router;
