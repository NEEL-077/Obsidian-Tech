const path = require('path');
const fs = require('fs');

const { sendEmail } = require('../utils/emailService');

// Order Status Enum
const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
};

// Status to email type mapping
const STATUS_EMAIL_MAP = {
  [ORDER_STATUS.PENDING]: 'orderPlaced',
  [ORDER_STATUS.CONFIRMED]: 'orderConfirmed',
  [ORDER_STATUS.PROCESSING]: 'orderConfirmed',
  [ORDER_STATUS.SHIPPED]: 'orderShipped',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'outForDelivery',
  [ORDER_STATUS.DELIVERED]: 'orderDelivered',
  [ORDER_STATUS.CANCELLED]: 'orderCancelled',
  [ORDER_STATUS.REFUNDED]: 'orderRefunded',
  [ORDER_STATUS.RETURNED]: 'orderReturned',
};

// Base email template
const getBaseTemplate = (content, title) => {
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
      .order-item { flex-direction: column !important; }
      .order-item img { margin-bottom: 10px !important; }
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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🏢 OBSIDIAN TECH</h1>
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
                Need help? Contact us at <a href="mailto:obsidiantech.1@gmail.com" style="color: #102C57; text-decoration: none;">obsidiantech.1@gmail.com</a><br>
                <a href="${process.env.FRONTEND_URL}/orders" style="color: #102C57; text-decoration: none;">View Your Orders</a> | 
                <a href="${process.env.FRONTEND_URL}/contact" style="color: #102C57; text-decoration: none;">Contact Support</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Generate order items HTML and attachments for CID embedding
const getOrderItemsAndAttachments = (items) => {
  const attachments = [];
  const html = items.map((item, index) => {
    const cid = `item-${index}`;
    let localPath = null;

    // Try to find the image on the local filesystem
    if (item.image?.startsWith('/images')) {
      localPath = path.join(__dirname, '../../frontend/public', item.image);
    } else if (item.image?.startsWith('/uploads')) {
      localPath = path.join(__dirname, '..', item.image);
    }

    // If local path exists, add as attachment and use CID, otherwise fallback to original URL
    const hasLocalFile = localPath && fs.existsSync(localPath);
    if (hasLocalFile) {
      attachments.push({
        filename: path.basename(localPath),
        path: localPath,
        cid: cid
      });
    }

    const src = hasLocalFile ? `cid:${cid}` : (item.image?.startsWith('http') ? item.image : `${process.env.BACKEND_URL || 'http://localhost:5001'}${item.image}`);

    return `
    <div class="order-item" style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #e9ecef; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
      <img src="${src}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px; border: 1px solid #dee2e6;">
      <div style="flex: 1;">
        <p style="margin: 0; font-weight: bold; color: #333;">${item.name}</p>
        <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">Qty: ${item.qty} × ₹${item.price?.toLocaleString('en-IN')}</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-weight: bold; color: #102C57; font-size: 18px;">₹${(item.price * item.qty)?.toLocaleString('en-IN')}</p>
      </div>
    </div>
  `;
  }).join('');

  return { html, attachments };
};

// Generate shipping address HTML
const getShippingAddressHtml = (address) => {
  return `
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333; font-size: 16px;">📍 Shipping Address</h3>
      <p style="margin: 5px 0; color: #555;">${address.address}</p>
      <p style="margin: 5px 0; color: #555;">${address.city}, ${address.postalCode}</p>
      <p style="margin: 5px 0; color: #555;">${address.country}</p>
    </div>
  `;
};

// Email Templates
const emailTemplates = {
  // Order Placed
  orderPlaced: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
        <h2 style="color: #102C57; margin: 0; font-size: 28px;">Order Placed Successfully!</h2>
        <p style="color: #6c757d; margin: 10px 0;">Thank you for shopping with OBSIDIAN TECH</p>
      </div>
      
      <p style="font-size: 18px;">Hi <strong>${data.userName}</strong>,</p>
      <p>We're excited to confirm that your order has been successfully placed and is being processed.</p>
      
      <div style="background: linear-gradient(135deg, #102C57 0%, #1a3d6d 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order Reference</p>
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">#${data.orderId}</p>
        <p style="margin: 5px 0; font-size: 14px;">Placed on ${new Date(data.orderDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <h3 style="color: #333; margin-top: 30px;">📦 Order Summary</h3>
      ${data.itemsHtml || ''}
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
          <span style="color: #6c757d;">Subtotal (Incl. GST):</span>
          <span style="font-weight: bold;">₹${(data.totalPrice - data.shippingPrice)?.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
          <span style="color: #6c757d;">Shipping:</span>
          <span style="font-weight: bold;">₹${data.shippingPrice?.toLocaleString('en-IN')}</span>
        </div>
        <div style="border-top: 1px solid #dee2e6; margin: 10px 0; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 13px; color: #6c757d;">
            <span>Base Price:</span>
            <span>₹${(data.totalPrice / 1.18)?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 13px; color: #6c757d;">
            <span>GST (18%):</span>
            <span>₹${(data.totalPrice - (data.totalPrice / 1.18))?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
        <div style="border-top: 2px solid #dee2e6; margin: 15px 0; padding-top: 15px; display: flex; justify-content: space-between;">
          <span style="font-size: 18px; font-weight: bold; color: #333;">Total Amount:</span>
          <span style="font-size: 18px; font-weight: bold; color: #28a745;">₹${data.totalPrice?.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      ${getShippingAddressHtml(data.shippingAddress)}
      
      ${data.gstNumber ? `
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
        <h3 style="margin-top: 0; color: #0d47a1; font-size: 16px;">🏢 Business GST Details</h3>
        <p style="margin: 5px 0; color: #1565c0;"><strong>Business:</strong> ${data.businessName}</p>
        <p style="margin: 5px 0; color: #1565c0;"><strong>GSTIN:</strong> ${data.gstNumber}</p>
        <p style="margin: 10px 0 0 0; color: #1565c0; font-size: 12px; font-style: italic;">A GST invoice will be generated for this purchase.</p>
      </div>
      ` : ''}
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #856404;"><strong>⏰ What's Next?</strong></p>
        <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">We'll send you an email once your order is confirmed and ready for shipment.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/order/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, #102C57 0%, #1a3d6d 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px;">Track Your Order</a>
      </div>
      
      <p style="color: #6c757d; font-size: 14px; text-align: center;">Questions? Reply to this email or contact our support team.</p>
    `;
    return {
      subject: `✅ Order Placed #${data.orderId} - OBSIDIAN TECH`,
      html: getBaseTemplate(content, 'Order Confirmation'),
    };
  },

  // Order Confirmed
  orderConfirmed: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 64px; margin-bottom: 10px;">✅</div>
        <h2 style="color: #28a745; margin: 0; font-size: 28px;">Order Confirmed!</h2>
        <p style="color: #6c757d; margin: 10px 0;">Your order is being prepared</p>
      </div>
      
      <p style="font-size: 18px;">Hi <strong>${data.userName}</strong>,</p>
      <p>Great news! Your order has been confirmed and our team is preparing it for shipment.</p>
      
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order Reference</p>
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">#${data.orderId}</p>
        <p style="margin: 10px 0; font-size: 16px;">✓ Confirmed & Processing</p>
      </div>
      
      <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #155724;"><strong>📦 Order Status:</strong> Confirmed</p>
        <p style="margin: 5px 0 0 0; color: #155724; font-size: 14px;">We're carefully packing your items. You'll receive a shipping notification soon.</p>
      </div>
      
      <h3 style="color: #333; margin-top: 30px;">📋 Order Details</h3>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Order ID:</strong> #${data.orderId}</p>
        <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${data.totalPrice?.toLocaleString('en-IN')}</p>
        <p style="margin: 5px 0;"><strong>Items:</strong> ${data.items?.length} item(s)</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/order/${data.orderId}" style="display: inline-block; background: #28a745; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px;">View Order Details</a>
      </div>
    `;
    return {
      subject: `✓ Order Confirmed #${data.orderId} - OBSIDIAN TECH`,
      html: getBaseTemplate(content, 'Order Confirmed'),
    };
  },

  // Order Shipped
  orderShipped: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 64px; margin-bottom: 10px;">🚚</div>
        <h2 style="color: #007bff; margin: 0; font-size: 28px;">Your Order is On the Way!</h2>
        <p style="color: #6c757d; margin: 10px 0;">Track your package in real-time</p>
      </div>
      
      <p style="font-size: 18px;">Hi <strong>${data.userName}</strong>,</p>
      <p>Exciting news! Your order has been shipped and is on its way to you.</p>
      
      <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order Reference</p>
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">#${data.orderId}</p>
        <p style="margin: 10px 0; font-size: 16px;">🚚 In Transit</p>
      </div>
      
      <div style="background-color: #cce5ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #004085;">📦 Tracking Information</h3>
        <p style="margin: 10px 0; color: #004085;"><strong>Carrier:</strong> ${data.carrier || 'Blue Dart Express'}</p>
        <p style="margin: 10px 0; color: #004085;"><strong>Tracking Number:</strong> <span style="font-family: monospace; font-size: 18px; background: white; padding: 5px 10px; border-radius: 4px;">${data.trackingNumber || 'N/A'}</span></p>
        ${data.estimatedDelivery ? `<p style="margin: 10px 0; color: #004085;"><strong>Estimated Delivery:</strong> ${new Date(data.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        ${data.trackingNumber ? `<a href="https://www.bluedart.com/tracking?track=${data.trackingNumber}" style="display: inline-block; background: #007bff; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px; margin: 5px;">Track Package</a>` : ''}
        <a href="${process.env.FRONTEND_URL}/order/${data.orderId}" style="display: inline-block; background: #6c757d; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px; margin: 5px;">View Order</a>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">📍 Delivery Address</h3>
        <p style="margin: 5px 0; color: #555;">${data.shippingAddress?.address}</p>
        <p style="margin: 5px 0; color: #555;">${data.shippingAddress?.city}, ${data.shippingAddress?.postalCode}</p>
      </div>
    `;
    return {
      subject: `🚚 Order Shipped #${data.orderId} - Track Your Package`,
      html: getBaseTemplate(content, 'Order Shipped'),
    };
  },

  // Out for Delivery
  outForDelivery: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 64px; margin-bottom: 10px;">📦</div>
        <h2 style="color: #fd7e14; margin: 0; font-size: 28px;">Out for Delivery!</h2>
        <p style="color: #6c757d; margin: 10px 0;">Your order will arrive today</p>
      </div>
      
      <p style="font-size: 18px;">Hi <strong>${data.userName}</strong>,</p>
      <p>Your order is out for delivery and will be arriving <strong>today</strong>! Please ensure someone is available to receive it.</p>
      
      <div style="background: linear-gradient(135deg, #fd7e14 0%, #e55c00 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order Reference</p>
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">#${data.orderId}</p>
        <p style="margin: 10px 0; font-size: 18px;">📦 Out for Delivery Today</p>
      </div>
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ Important</h3>
        <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
          <li>Please keep your phone accessible for the delivery agent</li>
          <li>Have your ID ready for verification if required</li>
          <li>If unavailable, the package may be left with a neighbor or returned</li>
        </ul>
      </div>
      
      ${data.trackingNumber ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.bluedart.com/tracking?track=${data.trackingNumber}" style="display: inline-block; background: #fd7e14; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px;">Track Live Location</a>
      </div>
      ` : ''}
    `;
    return {
      subject: `📦 Out for Delivery #${data.orderId} - Arriving Today!`,
      html: getBaseTemplate(content, 'Out for Delivery'),
    };
  },

  // Order Delivered
  orderDelivered: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
        <h2 style="color: #28a745; margin: 0; font-size: 28px;">Order Delivered!</h2>
        <p style="color: #6c757d; margin: 10px 0;">Your package has arrived</p>
      </div>
      
      <p style="font-size: 18px;">Hi <strong>${data.userName}</strong>,</p>
      <p>Great news! Your order has been successfully delivered. We hope you love your new purchase!</p>
      
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order Reference</p>
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">#${data.orderId}</p>
        <p style="margin: 10px 0; font-size: 18px;">✅ Delivered Successfully</p>
        ${data.deliveredAt ? `<p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Delivered on ${new Date(data.deliveredAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>` : ''}
      </div>
      
      <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #155724;">🌟 How was your experience?</h3>
        <p style="margin: 10px 0; color: #155724;">We'd love to hear your feedback! Your review helps us improve and helps other customers make informed decisions.</p>
        <div style="text-align: center; margin-top: 15px;">
          <a href="${process.env.FRONTEND_URL}/review/${data.orderId}" style="display: inline-block; background: #28a745; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold;">Write a Review</a>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">📋 Delivered Items</h3>
        ${data.itemsHtml || ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/products" style="display: inline-block; background: linear-gradient(135deg, #102C57 0%, #1a3d6d 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px;">Continue Shopping</a>
      </div>
      
      <p style="color: #6c757d; font-size: 14px; text-align: center;">Need help with your order? Contact our support team anytime.</p>
    `;
    return {
      subject: `🎉 Order Delivered #${data.orderId} - Enjoy Your Purchase!`,
      html: getBaseTemplate(content, 'Order Delivered'),
    };
  },

  // Order Cancelled
  orderCancelled: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 64px; margin-bottom: 10px;">😔</div>
        <h2 style="color: #dc3545; margin: 0; font-size: 28px;">Order Cancelled</h2>
        <p style="color: #6c757d; margin: 10px 0;">We're sorry to see you go</p>
      </div>
      
      <p style="font-size: 18px;">Hi <strong>${data.userName}</strong>,</p>
      <p>Your order has been cancelled as requested. If you didn't request this cancellation, please contact our support team immediately.</p>
      
      <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order Reference</p>
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">#${data.orderId}</p>
        <p style="margin: 10px 0; font-size: 16px;">❌ Cancelled</p>
      </div>
      
      ${data.refundAmount ? `
      <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #721c24;">💰 Refund Information</h3>
        <p style="margin: 10px 0; color: #721c24;"><strong>Refund Amount:</strong> ₹${data.refundAmount?.toLocaleString('en-IN')}</p>
        <p style="margin: 10px 0; color: #721c24;"><strong>Refund Method:</strong> ${data.refundMethod || 'Original payment method'}</p>
        <p style="margin: 10px 0; color: #721c24; font-size: 14px;">The refund will be processed within 5-7 business days.</p>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/products" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px;">Browse Products</a>
      </div>
      
      <p style="color: #6c757d; font-size: 14px; text-align: center;">Changed your mind? We're always here when you're ready to shop!</p>
    `;
    return {
      subject: `❌ Order Cancelled #${data.orderId} - OBSIDIAN TECH`,
      html: getBaseTemplate(content, 'Order Cancelled'),
    };
  },
  // Order Refunded
  orderRefunded: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 64px; margin-bottom: 10px;">💰</div>
        <h2 style="color: #102C57; margin: 0; font-size: 28px;">Refund Processed</h2>
        <p style="color: #6c757d; margin: 10px 0;">Your refund has been issued successfully</p>
      </div>
      
      <p style="font-size: 18px;">Hi <strong>${data.userName}</strong>,</p>
      <p>Your refund for order <strong>#${data.orderId}</strong> has been processed. The funds should appear in your original payment method within 5-7 business days.</p>
      
      <div style="background: linear-gradient(135deg, #102C57 0%, #1a3d6d 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Total Refunded</p>
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold;">₹${data.totalPrice?.toLocaleString('en-IN')}</p>
        <p style="margin: 10px 0; font-size: 16px;">✅ Refunded Successfully</p>
      </div>
      
      <div style="background-color: #FEFAF6; border-left: 4px solid #102C57; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #102C57;">💡 Information</h3>
        <p style="margin: 0; color: #6c757d;">It may take some time for your bank to post the refund to your account. If you don't see the funds after 7 business days, please contact your financial institution.</p>
      </div>
    `;
    return {
      subject: `💰 Refund Processed #${data.orderId} - OBSIDIAN TECH`,
      html: getBaseTemplate(content, 'Refund Processed'),
    };
  },

  // Order Returned
  orderReturned: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 64px; margin-bottom: 10px;">📦</div>
        <h2 style="color: #102C57; margin: 0; font-size: 28px;">Return Completed</h2>
        <p style="color: #6c757d; margin: 10px 0;">We have received your return</p>
      </div>
      
      <p style="font-size: 18px;">Hi <strong>${data.userName}</strong>,</p>
      <p>Your return for order <strong>#${data.orderId}</strong> has been received and processed. Thank you for your patience during this process.</p>
      
      <div style="background: linear-gradient(135deg, #102C57 0%, #1a3d6d 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order Reference</p>
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">#${data.orderId}</p>
        <p style="margin: 10px 0; font-size: 18px;">✅ Return Successful</p>
      </div>
    `;
    return {
      subject: `📦 Return Received #${data.orderId} - OBSIDIAN TECH`,
      html: getBaseTemplate(content, 'Return Received'),
    };
  },
};

// Send order status email with duplicate prevention
const sendOrderStatusEmail = async (order, status) => {
  try {
    const emailType = STATUS_EMAIL_MAP[status];
    if (!emailType) {
      console.log(`No email configured for status: ${status}`);
      return { success: false, error: 'No email template for this status' };
    }

    // [DEV ONLY] Duplicate check disabled for testing
    /*
    if (order.emailNotifications?.[emailType]?.sent) {
      console.log(`⚠️  SKIP EMAIL: Already sent ${emailType} for order ${order._id}. Reset flags for re-testing.`);
      return { success: false, error: 'Email already sent', alreadySent: true };
    }
    */

    const template = emailTemplates[emailType];
    if (!template) {
      console.error(`Template not found for ${emailType}`);
      return { success: false, error: 'Email template not found' };
    }

    const { html: itemsHtml, attachments } = getOrderItemsAndAttachments(order.orderItems);

    const emailData = {
      userName: order.userName,
      orderId: order._id.toString().slice(-8).toUpperCase(),
      orderDate: order.createdAt,
      totalPrice: order.totalPrice,
      shippingPrice: order.shippingPrice,
      taxPrice: order.taxPrice,
      items: order.orderItems,
      itemsHtml, // Pass pre-rendered items HTML
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      refundAmount: order.totalPrice,
      refundMethod: order.paymentMethod,
      gstNumber: order.gstNumber,
      businessName: order.businessName,
    };

    const rendered = template(emailData);

    console.log(`📧 Sending ${emailType} email to ${order.userEmail} for order ${order._id}`);

    const result = await sendEmail(order.userEmail, rendered.subject, rendered.html, attachments);

    if (result.success) {
      // Mark email as sent in order
      order.emailNotifications = order.emailNotifications || {};
      order.emailNotifications[emailType] = {
        sent: true,
        sentAt: new Date(),
      };
      await order.save();
      console.log(`✅ ${emailType} email sent successfully for order ${order._id}`);
    } else {
      console.error(`❌ Failed to send ${emailType} email:`, result.error);
    }

    return result;
  } catch (error) {
    console.error('Send order status email error:', error);
    return { success: false, error: error.message };
  }
};

// Update order status and send email
const updateOrderStatus = async (orderId, newStatus, options = {}) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    const previousStatus = order.status;

    // Update order fields
    order.status = newStatus;

    if (options.trackingNumber) order.trackingNumber = options.trackingNumber;
    if (options.carrier) order.carrier = options.carrier;
    if (options.estimatedDelivery) order.estimatedDelivery = options.estimatedDelivery;
    if (options.note) {
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: options.note,
      });
    }

    // Handle delivered status
    if (newStatus === ORDER_STATUS.DELIVERED) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    // Send email notification
    const emailResult = await sendOrderStatusEmail(order, newStatus);

    return {
      success: true,
      order,
      previousStatus,
      emailSent: emailResult.success,
      emailError: emailResult.error,
    };
  } catch (error) {
    console.error('Update order status error:', error);
    return { success: false, error: error.message };
  }
};

// Send order placed email (called when new order is created)
const sendOrderPlacedEmail = async (order) => {
  return await sendOrderStatusEmail(order, ORDER_STATUS.PENDING);
};

// Get email status for an order
const getOrderEmailStatus = async (orderId) => {
  try {
    const order = await Order.findById(orderId).select('emailNotifications status');
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    return {
      success: true,
      orderStatus: order.status,
      emailNotifications: order.emailNotifications || {},
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Resend email for a specific status
const resendOrderEmail = async (orderId, status) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Reset email sent flag
    const emailType = STATUS_EMAIL_MAP[status];
    if (emailType && order.emailNotifications?.[emailType]) {
      order.emailNotifications[emailType].sent = false;
      await order.save();
    }

    // Send email again
    return await sendOrderStatusEmail(order, status);
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  ORDER_STATUS,
  sendOrderStatusEmail,
  updateOrderStatus,
  sendOrderPlacedEmail,
  getOrderEmailStatus,
  resendOrderEmail,
  emailTemplates,
};
