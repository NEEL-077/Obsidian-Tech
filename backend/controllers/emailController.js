const { sendEmail, sendBulkEmails } = require('../utils/emailService');
const crypto = require('crypto');

// ==================== NEWSLETTER SUBSCRIPTION ====================

// Subscribe to newsletter
const subscribeNewsletter = async (req, res) => {
  try {
    const { email, name, preferences } = req.body;
    const userId = req.user?._id;

    // Check if already subscribed
    let subscriber = await NewsletterSubscriber.findOne({ email });
    
    if (subscriber) {
      if (subscriber.status === 'active') {
        return res.status(400).json({ message: 'Email already subscribed' });
      }
      // Reactivate subscription
      subscriber.status = 'active';
      subscriber.unsubscribedAt = null;
      if (preferences) subscriber.preferences = preferences;
      await subscriber.save();
    } else {
      // Create new subscription
      subscriber = await NewsletterSubscriber.create({
        email,
        name,
        user: userId,
        preferences: preferences || {
          promotions: true,
          newArrivals: true,
          orderUpdates: true,
          recommendations: true,
        },
        source: req.body.source || 'website',
      });

      // Send welcome email
      await sendEmail(email, 'welcome', { name });
    }

    res.status(201).json({
      message: 'Successfully subscribed to newsletter',
      subscriber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unsubscribe from newsletter
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.params;
    
    const subscriber = await NewsletterSubscriber.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.json({ message: 'Successfully unsubscribed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all subscribers (Admin)
const getSubscribers = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = status ? { status } : {};

    const subscribers = await NewsletterSubscriber.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await NewsletterSubscriber.countDocuments(query);

    res.json({
      subscribers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== EMAIL CAMPAIGNS ====================

// Create campaign
const createCampaign = async (req, res) => {
  try {
    const { name, subject, type, content, template, segment, scheduledAt } = req.body;

    const campaign = await EmailCampaign.create({
      name,
      subject,
      type,
      content,
      template,
      segment: segment || 'all',
      scheduledAt,
      status: scheduledAt ? 'scheduled' : 'draft',
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all campaigns
const getCampaigns = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const campaigns = await EmailCampaign.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await EmailCampaign.countDocuments(query);

    res.json({
      campaigns,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send campaign
const sendCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({ message: 'Campaign already sent' });
    }

    // Get recipients based on segment
    let recipients = [];
    switch (campaign.segment) {
      case 'newsletter_subscribers':
        const subscribers = await NewsletterSubscriber.find({ status: 'active' });
        recipients = subscribers.map(s => ({ email: s.email, name: s.name }));
        break;
      case 'active':
        const activeUsers = await User.find({ isActive: true });
        recipients = activeUsers.map(u => ({ email: u.email, name: u.name }));
        break;
      case 'vip':
        const vipUsers = await User.find({
          totalSpent: { $gte: 50000 },
        });
        recipients = vipUsers.map(u => ({ email: u.email, name: u.name }));
        break;
      case 'all':
      default:
        const allUsers = await User.find();
        recipients = allUsers.map(u => ({ email: u.email, name: u.name }));
    }

    // Update campaign status
    campaign.status = 'sending';
    campaign.recipients = recipients.map(r => ({
      email: r.email,
      status: 'pending',
    }));
    await campaign.save();

    // Send emails in background
    sendBulkEmails(recipients, campaign.template, {
      title: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
    }).then(async (results) => {
      // Update analytics
      const delivered = results.filter(r => r.status === 'fulfilled').length;
      campaign.status = 'sent';
      campaign.sentAt = new Date();
      campaign.analytics.totalSent = recipients.length;
      campaign.analytics.totalDelivered = delivered;
      await campaign.save();
    });

    res.json({
      message: 'Campaign is being sent',
      totalRecipients: recipients.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get campaign analytics
const getCampaignAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Calculate rates
    const { totalSent, totalDelivered, totalOpened, totalClicked } = campaign.analytics;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;

    res.json({
      campaign: {
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        sentAt: campaign.sentAt,
      },
      analytics: {
        ...campaign.analytics,
        openRate: openRate.toFixed(2),
        clickRate: clickRate.toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== AUTOMATED EMAILS ====================

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    await sendEmail(user.email, 'welcome', { name: user.name });
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Welcome email failed:', error);
  }
};

// Send order confirmation
const sendOrderConfirmation = async (order, user) => {
  try {
    await sendEmail(user.email, 'orderConfirmation', {
      orderId: order._id,
      total: order.totalPrice,
      items: order.orderItems.map(item => ({
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
      })),
    });
    console.log(`Order confirmation sent to ${user.email}`);
  } catch (error) {
    console.error('Order confirmation failed:', error);
  }
};

// Send shipping update
const sendShippingUpdate = async (order, user, status) => {
  try {
    await sendEmail(user.email, 'shippingUpdate', {
      orderId: order._id,
      status,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery,
    });
    console.log(`Shipping update sent to ${user.email}`);
  } catch (error) {
    console.error('Shipping update failed:', error);
  }
};

// ==================== ABANDONED CART ====================

// Create abandoned cart record
const createAbandonedCart = async (userId, cartItems, totalAmount) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Check if already exists
    const existing = await AbandonedCart.findOne({
      user: userId,
      status: { $in: ['pending', 'email_sent'] },
    });

    if (existing) {
      // Update existing
      existing.items = cartItems;
      existing.totalAmount = totalAmount;
      await existing.save();
      return;
    }

    // Create new abandoned cart
    await AbandonedCart.create({
      user: userId,
      email: user.email,
      items: cartItems.map(item => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
      })),
      totalAmount,
    });
  } catch (error) {
    console.error('Create abandoned cart failed:', error);
  }
};

// Process abandoned carts (run via cron job)
const processAbandonedCarts = async () => {
  try {
    const now = new Date();

    // First reminder (1 hour after abandonment)
    const firstReminder = await AbandonedCart.find({
      status: 'pending',
      createdAt: { $lte: new Date(now - 60 * 60 * 1000) },
      'emailsSent.type': { $ne: 'first' },
    });

    for (const cart of firstReminder) {
      const user = await User.findById(cart.user);
      if (user) {
        await sendEmail(cart.email, 'abandonedCart', {
          name: user.name,
          items: cart.items,
        });
        cart.emailsSent.push({ type: 'first', sentAt: new Date() });
        cart.status = 'email_sent';
        await cart.save();
      }
    }

    // Second reminder (24 hours after)
    const secondReminder = await AbandonedCart.find({
      status: 'email_sent',
      'emailsSent.type': 'first',
      'emailsSent.sentAt': { $lte: new Date(now - 24 * 60 * 60 * 1000) },
      'emailsSent.type': { $ne: 'second' },
    });

    for (const cart of secondReminder) {
      const user = await User.findById(cart.user);
      if (user) {
        await sendEmail(cart.email, 'abandonedCart', {
          name: user.name,
          items: cart.items,
          discount: 'COMEBACK15',
        });
        cart.emailsSent.push({ type: 'second', sentAt: new Date() });
        await cart.save();
      }
    }

    console.log(`Processed ${firstReminder.length} first reminders, ${secondReminder.length} second reminders`);
  } catch (error) {
    console.error('Process abandoned carts failed:', error);
  }
};

// Mark cart as recovered
const recoverAbandonedCart = async (userId) => {
  try {
    await AbandonedCart.updateMany(
      { user: userId, status: { $in: ['pending', 'email_sent'] } },
      { status: 'recovered', recoveredAt: new Date() }
    );
  } catch (error) {
    console.error('Recover abandoned cart failed:', error);
  }
};

// ==================== CUSTOMER SEGMENTATION ====================

// Create customer segment
const createSegment = async (req, res) => {
  try {
    const { name, description, criteria } = req.body;

    // Find matching users
    let userQuery = {};
    if (criteria.minSpent) userQuery.totalSpent = { $gte: criteria.minSpent };
    if (criteria.maxSpent) userQuery.totalSpent = { ...userQuery.totalSpent, $lte: criteria.maxSpent };
    if (criteria.minOrders) userQuery.orderCount = { $gte: criteria.minOrders };
    if (criteria.maxOrders) userQuery.orderCount = { ...userQuery.orderCount, $lte: criteria.maxOrders };

    const users = await User.find(userQuery).select('_id');

    const segment = await CustomerSegment.create({
      name,
      description,
      criteria,
      users: users.map(u => u._id),
    });

    res.status(201).json({
      message: 'Segment created successfully',
      segment,
      userCount: users.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all segments
const getSegments = async (req, res) => {
  try {
    const segments = await CustomerSegment.find()
      .populate('users', 'name email');

    res.json(segments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get segment users
const getSegmentUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const segment = await CustomerSegment.findById(id).populate('users');

    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    res.json(segment.users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PERSONALIZED RECOMMENDATIONS ====================

// Generate product recommendations for user
const generateRecommendations = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    // Get user's order history
    const orders = await Order.find({ user: userId });
    const purchasedProductIds = orders.flatMap(o => 
      o.orderItems.map(item => item.product.toString())
    );

    // Get user's viewed/wishlisted products (if tracked)
    const viewedCategories = user.viewedCategories || [];

    // Find similar products
    let recommendations = [];

    if (purchasedProductIds.length > 0) {
      // Get products from same brands/categories
      const purchasedProducts = await Product.find({
        _id: { $in: purchasedProductIds },
      });

      const brands = [...new Set(purchasedProducts.map(p => p.band))];
      const categories = [...new Set(purchasedProducts.map(p => p.category))];

      recommendations = await Product.find({
        $or: [
          { brand: { $in: brands } },
          { category: { $in: categories } },
        ],
        _id: { $nin: purchasedProductIds },
      })
        .limit(6)
        .select('name brand price image rating numReviews');
    } else {
      // New user - show trending products
      recommendations = await Product.find()
        .sort({ rating: -1, numReviews: -1 })
        .limit(6)
        .select('name brand price image rating numReviews');
    }

    return recommendations;
  } catch (error) {
    console.error('Generate recommendations failed:', error);
    return [];
  }
};

// Send recommendation email
const sendRecommendationEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const products = await generateRecommendations(userId);

    if (products.length === 0) {
      return res.status(400).json({ message: 'No recommendations available' });
    }

    await sendEmail(user.email, 'productRecommendation', { products });

    res.json({ message: 'Recommendation email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== EMAIL TRACKING ====================

// Track email open (pixel)
const trackEmailOpen = async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    const tracking = await EmailTracking.findOne({ trackingId, type: 'open' });
    if (tracking) {
      // Update campaign analytics
      await EmailCampaign.updateOne(
        { 'recipients.email': tracking.email },
        { 
          $inc: { 'analytics.totalOpened': 1 },
          $set: { 'recipients.$.status': 'opened', 'recipients.$.openedAt': new Date() }
        }
      );
    }

    // Return 1x1 transparent pixel
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  } catch (error) {
    res.status(500).end();
  }
};

// Track email click
const trackEmailClick = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { url } = req.query;

    const tracking = await EmailTracking.findOne({ trackingId, type: 'click' });
    if (tracking) {
      tracking.ipAddress = req.ip;
      tracking.userAgent = req.headers['user-agent'];
      await tracking.save();

      // Update campaign analytics
      await EmailCampaign.updateOne(
        { 'recipients.email': tracking.email },
        { 
          $inc: { 'analytics.totalClicked': 1 },
          $set: { 'recipients.$.status': 'clicked', 'recipients.$.clickedAt': new Date() }
        }
      );
    }

    // Redirect to original URL
    res.redirect(url || process.env.FRONTEND_URL);
  } catch (error) {
    res.redirect(process.env.FRONTEND_URL);
  }
};

// ==================== ANALYTICS DASHBOARD ====================

const getEmailAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Campaign stats
    const campaignStats = await EmailCampaign.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {} },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          totalSent: { $sum: '$analytics.totalSent' },
          totalOpened: { $sum: '$analytics.totalOpened' },
          totalClicked: { $sum: '$analytics.totalClicked' },
          totalBounced: { $sum: '$analytics.totalBounced' },
        },
      },
    ]);

    // Subscriber stats
    const subscriberStats = await NewsletterSubscriber.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Abandoned cart stats
    const abandonedCartStats = await AbandonedCart.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Recent campaigns
    const recentCampaigns = await EmailCampaign.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name subject status analytics sentAt');

    res.json({
      campaigns: campaignStats[0] || {
        totalCampaigns: 0,
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
      },
      subscribers: subscriberStats,
      abandonedCarts: abandonedCartStats,
      recentCampaigns,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // Newsletter
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers,
  
  // Campaigns
  createCampaign,
  getCampaigns,
  sendCampaign,
  getCampaignAnalytics,
  
  // Automated
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendShippingUpdate,
  
  // Abandoned Cart
  createAbandonedCart,
  processAbandonedCarts,
  recoverAbandonedCart,
  
  // Segments
  createSegment,
  getSegments,
  getSegmentUsers,
  
  // Recommendations
  generateRecommendations,
  sendRecommendationEmail,
  
  // Tracking
  trackEmailOpen,
  trackEmailClick,
  
  // Analytics
  getEmailAnalytics,
};
