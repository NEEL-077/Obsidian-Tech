const nodemailer = require('nodemailer');
const path = require('path');

// Email configuration
const createTransporter = () => {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email configuration missing. Check EMAIL_USER and EMAIL_PASS in .env');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s/g, ''), // Remove any spaces from password
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });

  return transporter;
};

// Verify transporter connection
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: 'Email configuration missing' };
    }

    await transporter.verify();
    console.log('✅ Email server connection verified');
    return { success: true };
  } catch (error) {
    console.error('❌ Email server verification failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  // ── Legacy templates ──────────────────────────────────────────────────────
  welcome: (data) => ({
    subject: 'Welcome to OBSIDIAN TECH! 🎉',
    html: getWelcomeTemplate(data),
  }),

  orderConfirmation: (data) => ({
    subject: `Order Confirmed #${data.orderId} 📱`,
    html: getOrderConfirmationTemplate(data),
  }),

  shippingUpdate: (data) => ({
    subject: `Your Order is ${data.status} 🚚`,
    html: getShippingTemplate(data),
  }),

  abandonedCart: (data) => ({
    subject: 'Forgot something? Your cart is waiting 🛒',
    html: getAbandonedCartTemplate(data),
  }),

  promotional: (data) => ({
    subject: data.subject,
    html: getPromotionalTemplate(data),
  }),

  newsletter: (data) => ({
    subject: data.subject,
    html: getNewsletterTemplate(data),
  }),

  productRecommendation: (data) => ({
    subject: 'Products you might love 💎',
    html: getRecommendationTemplate(data),
  }),

  // ── Order notification templates (used by orderNotificationService.js) ───
  // These keys MUST match STATUS_EMAIL_MAP in orderNotificationService.js

  orderPlaced: (data) => ({
    subject: `✅ Order Placed #${(data.orderId || '').toString().slice(-8).toUpperCase()} - OBSIDIAN TECH`,
    html: getOrderStatusTemplate({
      ...data,
      emoji: '🎉',
      headline: 'Order Placed Successfully!',
      headlineColor: '#102C57',
      statusBadge: 'Order Placed',
      badgeBg: 'linear-gradient(135deg, #102C57 0%, #1a3d6d 100%)',
      bodyText: `We're excited to confirm that your order has been successfully placed and is being processed.`,
      highlightText: "⏰ What's Next? We'll send you an email once your order is confirmed and ready for shipment.",
      highlightBg: '#FEFAF6',
      highlightColor: '#102C57',
      ctaText: 'Track Your Order',
      ctaColor: 'linear-gradient(135deg, #102C57 0%, #1a3d6d 100%)',
    }),
  }),

  orderConfirmed: (data) => ({
    subject: `✓ Order Confirmed #${(data.orderId || '').toString().slice(-8).toUpperCase()} - OBSIDIAN TECH`,
    html: getOrderStatusTemplate({
      ...data,
      emoji: '✅',
      headline: 'Order Confirmed!',
      headlineColor: '#102C57',
      statusBadge: 'Confirmed & Processing',
      badgeBg: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      bodyText: `Great news! Your order has been confirmed and our team is preparing it for shipment.`,
      highlightText: '📦 We\'re carefully packing your items. You\'ll receive a shipping notification soon.',
      highlightBg: '#d4edda',
      highlightColor: '#155724',
      ctaText: 'View Order Details',
      ctaColor: '#28a745',
    }),
  }),

  orderShipped: (data) => ({
    subject: `🚚 Order Shipped #${(data.orderId || '').toString().slice(-8).toUpperCase()} - Track Your Package`,
    html: getOrderStatusTemplate({
      ...data,
      emoji: '🚚',
      headline: 'Your Order is On the Way!',
      headlineColor: '#102C57',
      statusBadge: '🚚 In Transit',
      badgeBg: 'linear-gradient(135deg, #102C57 0%, #1a3d6d 100%)',
      bodyText: `Exciting news! Your order has been shipped and is on its way to you.`,
      highlightText: `📦 Carrier: ${data.carrier || 'Blue Dart'} | Tracking: ${data.trackingNumber || 'Pending'} | Est. Delivery: ${data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString('en-IN') : 'Soon'}`,
      highlightBg: '#FEFAF6',
      highlightColor: '#102C57',
      ctaText: 'Track Package',
      ctaColor: '#102C57',
    }),
  }),

  outForDelivery: (data) => ({
    subject: `📦 Out for Delivery #${(data.orderId || '').toString().slice(-8).toUpperCase()} - Arriving Today!`,
    html: getOrderStatusTemplate({
      ...data,
      emoji: '📦',
      headline: 'Out for Delivery!',
      headlineColor: '#fd7e14',
      statusBadge: '📦 Out for Delivery Today',
      badgeBg: 'linear-gradient(135deg, #fd7e14 0%, #e55c00 100%)',
      bodyText: `Your order is out for delivery and will be arriving today! Please ensure someone is available to receive it.`,
      highlightText: '⚠️ Keep your phone accessible for the delivery agent. Have your ID ready if required.',
      highlightBg: '#fff3cd',
      highlightColor: '#856404',
      ctaText: 'Track Live Location',
      ctaColor: '#fd7e14',
    }),
  }),

  orderDelivered: (data) => ({
    subject: `🎉 Order Delivered #${(data.orderId || '').toString().slice(-8).toUpperCase()} - Enjoy Your Purchase!`,
    html: getOrderStatusTemplate({
      ...data,
      emoji: '🎉',
      headline: 'Order Delivered!',
      headlineColor: '#28a745',
      statusBadge: '✅ Delivered Successfully',
      badgeBg: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      bodyText: `Great news! Your order has been successfully delivered. We hope you love your new purchase!`,
      highlightText: '🌟 Enjoying your phone? Leave a review to help other customers make informed decisions.',
      highlightBg: '#d4edda',
      highlightColor: '#155724',
      ctaText: 'Continue Shopping',
      ctaColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }),
  }),

  orderCancelled: (data) => ({
    subject: `❌ Order Cancelled #${(data.orderId || '').toString().slice(-8).toUpperCase()} - Obsidian Tech`,
    html: getOrderStatusTemplate({
      ...data,
      emoji: '😔',
      headline: 'Order Cancelled',
      headlineColor: '#dc3545',
      statusBadge: '❌ Cancelled',
      badgeBg: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
      bodyText: `Your order has been cancelled. If you didn't request this, please contact our support team immediately.`,
      highlightText: '💰 If you were charged, your refund will be processed within 5-7 business days to your original payment method.',
      highlightBg: '#f8d7da',
      highlightColor: '#721c24',
      ctaText: 'Browse Products',
      ctaColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }),
  }),

  twoFactorCode: (data) => ({
    subject: `${data.code} is your Obsidian Tech verification code 🔐`,
    html: getTwoFactorTemplate(data),
  }),
};

// Send email function
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);

    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email not configured. Set EMAIL_USER and EMAIL_PASS in .env');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: 'Failed to create email transporter' };
    }

    // Verify connection before sending
    const verifyResult = await verifyEmailConfig();
    if (!verifyResult.success) {
      console.error('❌ Email server not reachable:', verifyResult.error);
      return { success: false, error: `Email server error: ${verifyResult.error}` };
    }

    const mailOptions = {
      from: `"OBSIDIAN TECH" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('   Error code:', error.code);

    // Common error messages for debugging
    if (error.code === 'EAUTH') {
      console.error('   💡 Authentication failed. Check your email credentials.');
      console.error('   💡 For Gmail: Use an App Password, not your regular password');
      console.error('   💡 Generate at: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNECTION') {
      console.error('   💡 Connection failed. Check your internet and SMTP settings.');
    } else if (error.code === 'EENVELOPE') {
      console.error('   💡 Invalid email address format.');
    }

    return { success: false, error: error.message, code: error.code };
  }
};

// Send bulk emails
const sendBulkEmails = async (recipients, template, data = {}) => {
  const results = [];
  const batchSize = 50; // Send in batches to avoid rate limits

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const batchPromises = batch.map(recipient =>
      sendEmail(recipient.email, template, { ...data, ...recipient })
    );

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);

    // Delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
};

function getOrderStatusTemplate(data) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
  const orderId = (data.orderId || '').toString().slice(-8).toUpperCase();
  const itemsHtml = (data.items || []).map(item => {
    const imageUrl = item.image?.startsWith('http')
      ? item.image
      : `${backendUrl}${item.image?.startsWith('/') ? '' : '/'}${item.image}`;

    return `
    <div style="display:flex;align-items:center;padding:12px;border-bottom:1px solid #e9ecef;background:#f8f9fa;border-radius:8px;margin-bottom:8px;">
      <img src="${imageUrl}" alt="${item.name}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin-right:14px;border:1px solid #dee2e6;">
      <div style="flex:1;">
        <p style="margin:0;font-weight:bold;color:#333;">${item.name}</p>
        <p style="margin:4px 0 0;color:#6c757d;font-size:13px;">Qty: ${item.qty} x Rs.${(item.price || 0).toLocaleString('en-IN')}</p>
      </div>
      <p style="margin:0;font-weight:bold;color:#102C57;font-size:16px;">Rs.${((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</p>
    </div>
  `;
  }).join('');

  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:60px;margin-bottom:8px;">${data.emoji || '📱'}</div>
      <h2 style="color:${data.headlineColor || '#102C57'};margin:0;font-size:26px;">${data.headline}</h2>
      <p style="color:#6c757d;margin:8px 0 0;">Thank you for shopping with OBSIDIAN TECH</p>
    </div>
    <p style="font-size:17px;">Hi <strong>${data.userName || 'Valued Customer'}</strong>,</p>
    <p>${data.bodyText}</p>
    <div style="background:${data.badgeBg};color:white;padding:18px;border-radius:8px;margin:22px 0;text-align:center;">
      <p style="margin:0;font-size:13px;opacity:0.85;">Order Reference</p>
      <p style="margin:6px 0;font-size:22px;font-weight:bold;letter-spacing:2px;">#${orderId}</p>
      <p style="margin:6px 0;font-size:15px;">${data.statusBadge}</p>
    </div>
    <div style="background:${data.highlightBg};border-left:4px solid ${data.headlineColor};padding:14px 16px;margin:18px 0;border-radius:4px;">
      <p style="margin:0;color:${data.highlightColor};font-size:14px;">${data.highlightText}</p>
    </div>
    ${(data.items && data.items.length > 0) ? '<h3 style="color:#333;margin-top:26px;">Order Items</h3>' + itemsHtml : ''}
    ${data.shippingAddress ? `
    <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin:18px 0;">
      <h3 style="margin-top:0;color:#333;font-size:14px;">Shipping Address</h3>
      <p style="margin:4px 0;color:#555;font-size:14px;">${data.shippingAddress.address}</p>
      <p style="margin:4px 0;color:#555;font-size:14px;">${data.shippingAddress.city}, ${data.shippingAddress.postalCode} - ${data.shippingAddress.country}</p>
    </div>` : ''}
    <div style="text-align:center;margin:28px 0;">
      <a href="${process.env.FRONTEND_URL}/order-tracking/${data.orderId}"
         style="display:inline-block;background:${data.ctaColor};color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:30px;font-weight:bold;font-size:15px;">
        ${data.ctaText || 'View Order'}
      </a>
    </div>
    <p style="color:#6c757d;font-size:13px;text-align:center;">Questions? Contact <a href="mailto:obsidiantech.1@gmail.com" style="color:#102C57;">obsidiantech.1@gmail.com</a></p>
  `;
  return getBaseTemplate(content, data.headline);
}

// Email Templates (HTML)
function getBaseTemplate(content, title) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .header { font-size: 24px !important; }
      .content { font-size: 14px !important; }
      .button { width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" class="container" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #102C57 0%, #1a3d6d 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">OBSIDIAN TECH</h1>
              <p style="color: #EADBC8; margin: 10px 0 0 0; font-size: 14px;">Premium Smart Hub Ecosystem</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                © 2026 OBSIDIAN TECH. All rights reserved.<br>
                <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #102C57; text-decoration: none;">Unsubscribe</a> | 
                <a href="${process.env.FRONTEND_URL}/privacy" style="color: #102C57; text-decoration: none;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getWelcomeTemplate(data) {
  const content = `
    <h2 style="color: #102C57; margin-bottom: 20px;">Welcome to OBSIDIAN TECH, ${data.name || 'Valued Customer'}! 🎉</h2>
    <p>Thank you for joining our community of tech enthusiasts. Get ready to discover the latest smartphones with AI-powered recommendations tailored just for you.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">What's waiting for you:</h3>
      <ul style="padding-left: 20px;">
        <li>🎯 Personalized phone recommendations</li>
        <li>💰 Exclusive member discounts</li>
        <li>🚀 Early access to new arrivals</li>
        <li>📱 Expert reviews and comparisons</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/products" class="button" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 30px; font-weight: bold;">Start Shopping</a>
    </div>
    
    <p style="color: #6c757d; font-size: 14px;">If you have any questions, our support team is here to help at obsidiantech.1@gmail.com</p>
  `;
  return getBaseTemplate(content, 'Welcome to Obsidian Tech');
}

function getOrderConfirmationTemplate(data) {
  const content = `
    <h2 style="color: #28a745; margin-bottom: 20px;">Order Confirmed! ✅</h2>
    <p>Thank you for your order. We've received your payment and are preparing your items for shipment.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Order Details</h3>
      <p><strong>Order ID:</strong> #${data.orderId}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Total:</strong> ₹${data.total?.toLocaleString('en-IN')}</p>
    </div>
    
    <div style="margin: 20px 0;">
      <h3>Items Ordered:</h3>
      ${data.items?.map(item => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const imageUrl = item.image?.startsWith('http')
      ? item.image
      : `${backendUrl}${item.image?.startsWith('/') ? '' : '/'}${item.image}`;

    return `
        <div style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #e9ecef;">
          <img src="${imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
          <div>
            <p style="margin: 0; font-weight: bold;">${item.name}</p>
            <p style="margin: 5px 0 0 0; color: #6c757d;">Qty: ${item.qty} × ₹${item.price?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      `;
  }).join('')}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/order/${data.orderId}" style="display: inline-block; background: #28a745; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 30px; font-weight: bold;">Track Order</a>
    </div>
  `;
  return getBaseTemplate(content, 'Order Confirmation');
}

function getShippingTemplate(data) {
  const statusColors = {
    'Shipped': '#007bff',
    'Out for Delivery': '#ffc107',
    'Delivered': '#28a745',
  };

  const content = `
    <h2 style="color: ${statusColors[data.status] || '#667eea'}; margin-bottom: 20px;">Shipping Update: ${data.status} 🚚</h2>
    <p>Good news! Your order <strong>#${data.orderId}</strong> has been ${data.status.toLowerCase()}.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Tracking Information</h3>
      <p><strong>Carrier:</strong> ${data.carrier || 'Blue Dart'}</p>
      <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      <p><strong>Expected Delivery:</strong> ${data.estimatedDelivery}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.trackingUrl || process.env.FRONTEND_URL + '/tracking'}" style="display: inline-block; background: #007bff; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 30px; font-weight: bold;">Track Package</a>
    </div>
  `;
  return getBaseTemplate(content, 'Shipping Update');
}

function getAbandonedCartTemplate(data) {
  const content = `
    <h2 style="color: #dc3545; margin-bottom: 20px;">Your Cart Misses You! 🛒</h2>
    <p>Hi ${data.name || 'there'}, you left some amazing items in your cart. Complete your purchase before they're gone!</p>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;"><strong>⏰ Limited Time:</strong> Use code <strong>COMEBACK10</strong> for 10% off your order!</p>
    </div>
    
    <div style="margin: 20px 0;">
      <h3>Items in Your Cart:</h3>
      ${data.items?.map(item => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const imageUrl = item.image?.startsWith('http')
      ? item.image
      : `${backendUrl}${item.image?.startsWith('/') ? '' : '/'}${item.image}`;

    return `
        <div style="display: flex; align-items: center; padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 10px;">
          <img src="${imageUrl}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: bold;">${item.name}</p>
            <p style="margin: 5px 0; color: #102C57; font-size: 18px; font-weight: bold;">₹${item.price?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      `;
  }).join('')}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/cart" style="display: inline-block; background: #dc3545; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 18px;">Complete Purchase</a>
    </div>
  `;
  return getBaseTemplate(content, 'Complete Your Purchase');
}

function getPromotionalTemplate(data) {
  const content = `
    <h2 style="color: #667eea; margin-bottom: 20px;">${data.title}</h2>
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h1 style="margin: 0; font-size: 48px;">${data.discount}</h1>
      <p style="margin: 10px 0; font-size: 18px;">${data.description}</p>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Use code: <strong>${data.code}</strong></p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.link || process.env.FRONTEND_URL + '/products'}" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 18px;">Shop Now</a>
    </div>
    
    <p style="text-align: center; color: #6c757d; font-size: 12px;">Offer valid until ${data.expiryDate || 'limited time only'}. Terms and conditions apply.</p>
  `;
  return getBaseTemplate(content, data.title);
}

function getNewsletterTemplate(data) {
  const content = `
    <h2 style="color: #667eea; margin-bottom: 20px;">${data.title}</h2>
    <div style="margin: 20px 0;">
      ${data.content}
    </div>
    
    ${data.products ? `
    <h3 style="margin-top: 30px;">Featured Products</h3>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
      ${data.products.map(product => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const imageUrl = product.image?.startsWith('http')
      ? product.image
      : `${backendUrl}${product.image?.startsWith('/') ? '' : '/'}${product.image}`;

    return `
        <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
          <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: cover;">
          <div style="padding: 15px;">
            <p style="margin: 0; font-weight: bold; font-size: 14px;">${product.name}</p>
            <p style="margin: 5px 0; color: #102C57; font-weight: bold;">₹${product.price?.toLocaleString('en-IN')}</p>
            <a href="${process.env.FRONTEND_URL}/product/${product._id}" style="display: inline-block; background: #102C57; color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-size: 12px; margin-top: 10px;">View Details</a>
          </div>
        </div>
      `;
  }).join('')}
    </div>
    ` : ''}
  `;
  return getBaseTemplate(content, data.title);
}

function getRecommendationTemplate(data) {
  const content = `
    <h2 style="color: #667eea; margin-bottom: 20px;">Products You'll Love 💎</h2>
    <p>Based on your browsing history and preferences, we think you'll love these:</p>
    
    <div style="margin: 20px 0;">
      ${data.products?.map(product => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const imageUrl = product.image?.startsWith('http')
      ? product.image
      : `${backendUrl}${product.image?.startsWith('/') ? '' : '/'}${product.image}`;

    return `
        <div style="display: flex; align-items: center; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 15px;">
          <img src="${imageUrl}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-right: 20px;">
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${product.name}</p>
            <p style="margin: 5px 0; color: #6c757d; font-size: 14px;">${product.brand}</p>
            <p style="margin: 5px 0; color: #102C57; font-size: 20px; font-weight: bold;">₹${product.price?.toLocaleString('en-IN')}</p>
            <p style="margin: 5px 0; color: #ffc107;">★ ${product.rating} (${product.reviews} reviews)</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/product/${product._id}" style="background: #102C57; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">View</a>
        </div>
      `;
  }).join('')}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/products" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 30px; font-weight: bold;">Browse More</a>
    </div>
  `;
  return getBaseTemplate(content, 'Recommended for You');
}

// Send order confirmation email
const sendOrderConfirmation = async (order) => {
  try {
    const user = { email: order.userEmail, name: order.userName };
    const emailContent = emailTemplates.orderConfirmation({
      orderId: order._id,
      total: order.totalPrice,
      items: order.orderItems.map(item => ({
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
      })),
    });

    return await sendEmail(user.email, 'orderConfirmation', {
      orderId: order._id,
      total: order.totalPrice,
      items: order.orderItems,
    });
  } catch (error) {
    console.error('Send order confirmation failed:', error);
    return { success: false, error: error.message };
  }
};

// Send order status update email
const sendOrderStatusUpdate = async (order, status) => {
  try {
    const emailContent = emailTemplates.shippingUpdate({
      orderId: order._id,
      status: status,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery,
    });

    return await sendEmail(order.userEmail, 'shippingUpdate', {
      orderId: order._id,
      status,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery,
    });
  } catch (error) {
    console.error('Send order status update failed:', error);
    return { success: false, error: error.message };
  }
};

// Send order delivered email
const sendOrderDelivered = async (order) => {
  try {
    return await sendEmail(order.userEmail, 'shippingUpdate', {
      orderId: order._id,
      status: 'Delivered',
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      estimatedDelivery: 'Delivered',
    });
  } catch (error) {
    console.error('Send order delivered failed:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    return await sendEmail(user.email, 'welcome', { name: user.name });
  } catch (error) {
    console.error('Send welcome email failed:', error);
    return { success: false, error: error.message };
  }
};

// --- New 2FA Template ---
function getTwoFactorTemplate(data) {
  const content = `
    <h2 style="color: #102C57; margin-bottom: 20px; text-align: center;">Security Verification 🛡️</h2>
    <p style="text-align: center;">You are attempting to access your OBSIDIAN TECH account or change your security settings. Use the verification code below to proceed.</p>
    
    <div style="background-color: #f7fafc; border: 2px dashed #e2e8f0; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
      <h1 style="margin: 0; font-size: 42px; color: #1a202c; letter-spacing: 8px; font-family: monospace;">${data.code}</h1>
    </div>
    
    <div style="background-color: #fffaf0; border-left: 4px solid #ed8936; padding: 15px; border-radius: 4px; margin-bottom: 24px;">
      <p style="margin: 0; color: #7b341e; font-size: 13px;"><strong>⚠️ Important:</strong> This code is valid for 10 minutes. If you did not request this code, please change your password immediately and contact support.</p>
    </div>
    
    <p style="color: #a0aec0; font-size: 12px; text-align: center;">This is an automated security notification. Please do not reply to this email.</p>
  `;
  return getBaseTemplate(content, 'Security Verification Code');
}

module.exports = {
  sendEmail,
  sendBulkEmails,
  emailTemplates,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendOrderDelivered,
  sendWelcomeEmail,
  verifyEmailConfig,
};
