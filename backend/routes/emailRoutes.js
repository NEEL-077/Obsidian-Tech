const express = require('express');
const router = express.Router();
const {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers,
  createCampaign,
  getCampaigns,
  sendCampaign,
  getCampaignAnalytics,
  createSegment,
  getSegments,
  getSegmentUsers,
  sendRecommendationEmail,
  trackEmailOpen,
  trackEmailClick,
  getEmailAnalytics,
} = require('../controllers/emailController');
const { sendEmail, verifyEmailConfig } = require('../utils/emailService');
const { testAllProviders, getProviderHelp } = require('../utils/emailDiagnostics');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/subscribe', subscribeNewsletter);
router.get('/unsubscribe/:email', unsubscribeNewsletter);
router.get('/track/open/:trackingId', trackEmailOpen);
router.get('/track/click/:trackingId', trackEmailClick);

// Test email endpoint (Admin only)
router.post('/test', protect, admin, async (req, res) => {
  try {
    const { email, template } = req.body;
    const result = await sendEmail(email, template || 'welcome', { name: 'Test User' });
    
    if (result.success) {
      res.json({ message: 'Test email sent successfully', messageId: result.messageId });
    } else {
      res.status(500).json({ message: 'Failed to send test email', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Run email diagnostics (Admin only)
router.get('/diagnostics', protect, admin, async (req, res) => {
  try {
    const results = await testAllProviders();
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get provider setup help
router.get('/help/:provider', (req, res) => {
  const { provider } = req.params;
  const help = getProviderHelp(provider);
  res.json({ provider, help });
});

// Verify email configuration (Admin only)
router.get('/verify', protect, admin, async (req, res) => {
  try {
    const result = await verifyEmailConfig();
    if (result.success) {
      res.json({ 
        message: 'Email configuration is valid',
        config: {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          user: process.env.EMAIL_USER,
        }
      });
    } else {
      res.status(500).json({ 
        message: 'Email configuration failed', 
        error: result.error,
        hint: 'Check your EMAIL_USER and EMAIL_PASS in .env file'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected routes (Admin only)
router.get('/subscribers', protect, admin, getSubscribers);
router.get('/analytics', protect, admin, getEmailAnalytics);

// Campaign routes
router.route('/campaigns')
  .get(protect, admin, getCampaigns)
  .post(protect, admin, createCampaign);

router.post('/campaigns/:id/send', protect, admin, sendCampaign);
router.get('/campaigns/:id/analytics', protect, admin, getCampaignAnalytics);

// Segment routes
router.route('/segments')
  .get(protect, admin, getSegments)
  .post(protect, admin, createSegment);

router.get('/segments/:id/users', protect, admin, getSegmentUsers);

// Recommendation routes
router.post('/recommendations/:userId/send', protect, admin, sendRecommendationEmail);

module.exports = router;
