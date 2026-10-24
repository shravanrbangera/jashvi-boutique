const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Invoice = require('../models/Invoice');
const DeliveryZone = require('../models/DeliveryZone');
const Coupon = require('../models/Coupon');
const AdminAuditLog = require('../models/AdminAuditLog');
const { paymentService } = require('../services/payment/paymentService');

/**
 * Generate readable, non-sequentially guessable Order Number
 */
function generateOrderNumber() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `JB-${new Date().getFullYear()}-${randomStr}`;
}

function generateInvoiceNumber() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INV-${new Date().getFullYear()}-${randomStr}`;
}

/**
 * Create Order with atomic concurrency-safe stock deduction and server-side pricing recalculation
 */
async function createOrder(req, res, next) {
  const reservedItems = []; // For compensation rollback if needed

  try {
    const { items, deliveryAddress, paymentMethod, couponCode, notes } = req.body;
    const user = req.user;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    if (!deliveryAddress || !deliveryAddress.pincode || !deliveryAddress.addressLine || !deliveryAddress.fullName) {
      return res.status(400).json({ success: false, message: 'Complete delivery address is required.' });
    }

    if (!['COD', 'ONLINE'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method selected.' });
    }

    // 1. Verify delivery zone serviceability from DB
    const deliveryCheck = await DeliveryZone.checkServiceability(deliveryAddress.pincode);
    if (!deliveryCheck.serviceable) {
      return res.status(400).json({
        success: false,
        message: deliveryCheck.message || 'Delivery is not available to the entered PIN code.',
      });
    }

    const deliveryCharge = Number(deliveryCheck.deliveryCharge) || 0;

    // 2. Validate items & deduct stock atomically with compensation capability
    const orderItemSnapshots = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      if (!product || product.isArchived || product.status !== 'published') {
        throw new Error(`Product "${item.name || 'item'}" is no longer available.`);
      }

      // Find variant
      const variant = product.variants.find((v) => v.sku === item.variantSku) ||
        product.variants.find((v) => v.size === item.size && v.color === item.color) ||
        product.variants[0];

      if (!variant) {
        throw new Error(`The requested size/colour option for "${product.name}" is not available.`);
      }

      const qty = Math.max(1, Number(item.quantity));

      // Concurrency-safe atomic deduction
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: product._id,
          variants: {
            $elemMatch: {
              _id: variant._id,
              stock: { $gte: qty },
            },
          },
        },
        {
          $inc: { 'variants.$.stock': -qty },
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(
          `Insufficient stock for "${product.name}" (${variant.size}/${variant.color}). Only ${variant.stock} left in stock.`
        );
      }

      // Record for compensation if subsequent items fail
      reservedItems.push({
        productId: product._id,
        variantId: variant._id,
        quantity: qty,
      });

      // Price snapshot strictly from DB
      const unitPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice;
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      orderItemSnapshots.push({
        product: product._id,
        sku: variant.sku,
        name: product.name,
        size: variant.size,
        color: variant.color,
        image: product.images[0] || '',
        unitPrice,
        quantity: qty,
        lineTotal,
      });
    }

    // 3. Calculate discounts if coupon provided
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (coupon) {
        const couponResult = coupon.calculateDiscount(subtotal);
        if (couponResult.valid) {
          discount = couponResult.discount;
          appliedCoupon = coupon.code;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const finalTotal = Math.max(0, subtotal - discount + deliveryCharge);
    const orderNumber = generateOrderNumber();
    const trackingToken = uuidv4();

    // 4. Create Order
    const order = await Order.create({
      orderNumber,
      trackingToken,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: deliveryAddress.phone || user.phone,
      },
      items: orderItemSnapshots,
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        addressLine: deliveryAddress.addressLine,
        landmark: deliveryAddress.landmark || '',
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
      },
      pricing: {
        subtotal,
        discount,
        couponCode: appliedCoupon,
        deliveryCharge,
        tax: 0,
        finalTotal,
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        provider: paymentMethod === 'ONLINE' ? (paymentService.isMockProvider() ? 'MOCK_SANDBOX_DEV' : 'RAZORPAY') : 'COD',
        isMock: paymentMethod === 'ONLINE' ? paymentService.isMockProvider() : false,
      },
      fulfillmentStatus: 'Placed',
      inventoryDeducted: true,
      notes: notes || '',
      timeline: [
        {
          status: 'Placed',
          note: `Order placed successfully via ${paymentMethod}.`,
          updatedBy: 'Customer',
        },
      ],
    });

    // 5. Generate Invoice Snapshot
    const invoiceNumber = generateInvoiceNumber();
    const invoice = await Invoice.create({
      invoiceNumber,
      order: order._id,
      orderNumber: order.orderNumber,
      customerInfo: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: deliveryAddress.phone || user.phone,
      },
      deliveryAddress: order.deliveryAddress,
      items: order.items,
      pricing: order.pricing,
      paymentInfo: {
        method: order.payment.method,
        status: order.payment.status,
      },
      approvalStatus: 'PENDING',
    });

    // 6. If payment is ONLINE, create gateway order
    let paymentGatewayOrder = null;
    if (paymentMethod === 'ONLINE') {
      paymentGatewayOrder = await paymentService.createPaymentOrder({
        orderId: order._id.toString(),
        amountInPaise: finalTotal * 100,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderNumber: order.orderNumber,
          customerName: user.name,
        },
      });

      order.payment.gatewayOrderId = paymentGatewayOrder.gatewayOrderId;
      await order.save();
    }

    // 7. Clear user cart
    await Cart.deleteOne({ user: user._id });

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        trackingToken: order.trackingToken,
        finalTotal: order.pricing.finalTotal,
        paymentMethod: order.payment.method,
        paymentStatus: order.payment.status,
        fulfillmentStatus: order.fulfillmentStatus,
        deliveryAddress: order.deliveryAddress,
      },
      invoiceNumber: invoice.invoiceNumber,
      paymentGatewayOrder,
    });
  } catch (err) {
    // COMPENSATION ROLLBACK: restore reserved stock
    if (reservedItems.length > 0) {
      console.warn('[Order Compensation] Rolling back stock for reserved items due to failure...');
      for (const item of reservedItems) {
        await Product.findOneAndUpdate(
          { _id: item.productId, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': item.quantity } }
        ).catch((rbErr) => console.error('[Rollback Error]', rbErr.message));
      }
    }
    next(err);
  }
}

/**
 * Get customer orders
 */
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single order details (ownership verified)
 */
async function getOrderDetails(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid order identifier.' });
    }

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id }).lean();
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = order.user.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied to this order.' });
    }

    const invoice = await Invoice.findOne({ order: order._id }).lean();

    res.json({
      success: true,
      order,
      invoice,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public Track Order endpoint with verification
 * Requires orderNumber AND customer phone to prevent unauthorized enumeration
 */
async function trackOrder(req, res, next) {
  try {
    const { orderNumber, phone } = req.body;

    if (!orderNumber || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your Order ID and the phone number used at checkout.',
      });
    }

    const order = await Order.findOne({
      orderNumber: orderNumber.trim(),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found with the provided Order ID.',
      });
    }

    // Phone number verification (match last 4 digits or exact match for privacy protection)
    const normalizedEnteredPhone = phone.replace(/\D/g, '');
    const normalizedOrderPhone = (order.deliveryAddress.phone || order.user.phone || '').replace(/\D/g, '');

    const isPhoneMatched =
      normalizedOrderPhone.endsWith(normalizedEnteredPhone.slice(-4)) ||
      normalizedOrderPhone === normalizedEnteredPhone;

    if (!isPhoneMatched) {
      return res.status(401).json({
        success: false,
        message: 'Phone number verification failed. Please enter the contact number associated with this order.',
      });
    }

    // Return tracking information safely without leaking full sensitive details
    res.json({
      success: true,
      trackingInfo: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        fulfillmentStatus: order.fulfillmentStatus,
        paymentStatus: order.payment.status,
        paymentMethod: order.payment.method,
        timeline: order.timeline,
        trackingDetails: order.trackingDetails,
        itemCount: order.items.length,
        itemsPreview: order.items.map((i) => ({ name: i.name, size: i.size, image: i.image, quantity: i.quantity })),
        city: order.deliveryAddress.city,
        state: order.deliveryAddress.state,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------------
// ADMIN ORDER MANAGEMENT
// ------------------------------------------------------------------------

/**
 * Admin: Get all orders with filter and pagination
 */
async function getAllOrders(req, res, next) {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.fulfillmentStatus = status;
    if (paymentStatus) filter['payment.status'] = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update fulfillment status
 */
async function updateFulfillmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note, courierPartner, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.fulfillmentStatus;
    order.fulfillmentStatus = status;

    if (courierPartner) order.trackingDetails.courierPartner = courierPartner;
    if (trackingNumber) order.trackingDetails.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.trackingDetails.estimatedDelivery = estimatedDelivery;

    order.timeline.push({
      status,
      note: note || `Status updated to ${status} by boutique administration.`,
      updatedBy: req.user.name,
      timestamp: new Date(),
    });

    await order.save();

    // Auto-approve provisional invoice when order is confirmed by boutique administration
    if (['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status)) {
      await Invoice.findOneAndUpdate(
        { order: order._id, approvalStatus: 'PENDING' },
        { approvalStatus: 'APPROVED', approvedAt: new Date(), approvedBy: req.user.email }
      );
    }

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'Order',
      entityId: order._id.toString(),
      details: `Order ${order.orderNumber} fulfillment status changed from "${previousStatus}" to "${status}".`,
      previousState: { status: previousStatus },
      newState: { status },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Order status updated to "${status}".`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Cancel order and restore inventory if eligible
 */
async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.fulfillmentStatus === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an order that has already been delivered. Please use return workflow.',
      });
    }

    // Restore stock
    if (order.inventoryDeducted) {
      for (const item of order.items) {
        await Product.findOneAndUpdate(
          { _id: item.product, 'variants.sku': item.sku },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      }
      order.inventoryDeducted = false;
    }

    order.fulfillmentStatus = 'Cancelled';
    order.timeline.push({
      status: 'Cancelled',
      note: `Order cancelled. Reason: ${reason || 'Admin cancellation'} - Inventory restored.`,
      updatedBy: req.user.name,
    });

    await order.save();

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'ORDER_CANCELLED',
      entityType: 'Order',
      entityId: order._id.toString(),
      details: `Order ${order.orderNumber} cancelled. Stock restored to inventory. Reason: ${reason}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Order cancelled and stock restored to inventory.',
      order,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  trackOrder,
  getAllOrders,
  updateFulfillmentStatus,
  cancelOrder,
};
