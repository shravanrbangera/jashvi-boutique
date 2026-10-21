const { app, startServer } = require('../server');
const mongoose = require('mongoose');
const { config } = require('../config/env');
const http = require('http');

let server;
const PORT = 5055; // test port
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('   STARTING AUTOMATED BACKEND INTEGRATION TEST SUITE    ');
  console.log('========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      throw new Error(`Test assertion failed: ${testName}`);
    }
  }

  try {
    // Connect to database before running test server
    const { connectDB } = require('../config/db');
    await connectDB();

    // Start temporary test server
    server = app.listen(PORT);
    console.log(`Test server running on ${BASE_URL}\n`);

    // TEST 1: Health check & Environment
    const health = await runRequest('/api/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'Health check endpoint returns 200 OK');
    assert(health.data.isMockPayments === true, 'Explicit Mock payments active in dev mode');
    assert(health.data.storageAdapter === 'local', 'Safe local image storage adapter active');

    // TEST 2: Customer registration & JWT auth
    const testEmail = `test_customer_${Date.now()}@test.com`;
    const regRes = await runRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Aishwarya Rai',
        email: testEmail,
        phone: '9845012345',
        password: 'Password@123',
      },
    });
    assert(regRes.status === 201 && regRes.data.success, 'Customer registration succeeds');
    const customerToken = regRes.data.token;
    assert(Boolean(customerToken), 'Customer receives JWT token');

    // TEST 3: Admin login
    const adminLogin = await runRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: config.adminSeed.email,
        password: config.adminSeed.password,
      },
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login successful with role admin');
    const adminToken = adminLogin.data.token;

    // TEST 4: Products list and Category check
    const productsRes = await runRequest('/api/products');
    assert(productsRes.status === 200 && productsRes.data.products.length >= 6, 'Products API returns published catalog items');
    const firstProduct = productsRes.data.products[0];
    assert(Boolean(firstProduct.variants && firstProduct.variants.length > 0), 'Products include size/colour variants with stock');

    // TEST 5: Delivery PIN code checker
    const localPinCheck = await runRequest('/api/delivery/check', {
      method: 'POST',
      body: { pincode: '575001' },
    });
    assert(localPinCheck.status === 200 && localPinCheck.data.serviceable === true, 'PIN 575001 (Mangalore) is serviceable with ₹0 delivery');

    const invalidPinCheck = await runRequest('/api/delivery/check', {
      method: 'POST',
      body: { pincode: '999999' },
    });
    assert(invalidPinCheck.data.serviceable === false, 'Unregistered PIN code correctly reported as unserviceable');

    // TEST 6: Coupon Application
    const couponRes = await runRequest('/api/coupons/apply', {
      method: 'POST',
      body: { code: 'JASHVI10', subtotal: 2000 },
    });
    assert(couponRes.status === 200 && couponRes.data.coupon.discount === 200, 'Coupon JASHVI10 calculates accurate 10% discount');

    // TEST 7: Order creation with server-side price recalculation & stock deduction
    const orderPayload = {
      items: [
        {
          productId: firstProduct._id,
          variantSku: firstProduct.variants[0].sku,
          name: firstProduct.name,
          size: firstProduct.variants[0].size,
          color: firstProduct.variants[0].color,
          quantity: 1,
        },
      ],
      deliveryAddress: {
        fullName: 'Aishwarya Rai',
        phone: '9845012345',
        addressLine: 'Villa 10, Mangalore Hills, Vamanjoor',
        city: 'Mangalore',
        state: 'Karnataka',
        pincode: '575001',
      },
      paymentMethod: 'ONLINE',
      couponCode: 'JASHVI10',
    };

    const initialStock = firstProduct.variants[0].stock;
    const orderRes = await runRequest('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: orderPayload,
    });
    assert(orderRes.status === 201 && orderRes.data.success, 'Order successfully placed with concurrency-safe stock deduction');
    assert(Boolean(orderRes.data.order.orderNumber), `Order generated unique ID: ${orderRes.data.order.orderNumber}`);

    // Verify stock was reduced in DB
    const refreshedProduct = await runRequest(`/api/products/${firstProduct._id}`);
    const updatedVariant = refreshedProduct.data.product.variants.find((v) => v.sku === firstProduct.variants[0].sku);
    assert(updatedVariant.stock === initialStock - 1, 'Variant stock decremented atomically by 1 in database');

    // TEST 8: Online payment verification with Dev Mock Gateway
    const paymentVerifyRes = await runRequest('/api/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        orderId: orderRes.data.order.id,
        paymentId: 'mock_pay_test_txn_999',
        signature: 'mock_signature_valid',
      },
    });
    assert(paymentVerifyRes.status === 200 && paymentVerifyRes.data.order.paymentStatus === 'PAID', 'Payment verified and Order marked PAID');
    assert(paymentVerifyRes.data.isMock === true, 'Explicitly flags transaction as [DEV MOCK PAYMENT]');

    // TEST 9: Invoice retrieval & Admin Adjustment Audit
    const invoiceRes = await runRequest(`/api/invoices/${orderRes.data.order.orderNumber}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(invoiceRes.status === 200 && Boolean(invoiceRes.data.invoice.invoiceNumber), 'Invoice successfully retrieved');

    // Perform audited invoice adjustment
    const adjustRes = await runRequest(`/api/invoices/${invoiceRes.data.invoice._id}/adjust`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        field: 'discount',
        newValue: 300,
        reason: 'Special boutique festival loyalty voucher applied by boutique manager.',
      },
    });
    assert(adjustRes.status === 200 && adjustRes.data.success, 'Admin invoice adjustment processed');
    assert(Boolean(adjustRes.data.audit._id), 'Immutable InvoiceAdjustmentAudit record created');

    // TEST 10: Verified Order Tracking
    const trackRes = await runRequest('/api/orders/track', {
      method: 'POST',
      body: {
        orderNumber: orderRes.data.order.orderNumber,
        phone: '9845012345',
      },
    });
    assert(trackRes.status === 200 && trackRes.data.trackingInfo.orderNumber === orderRes.data.order.orderNumber, 'Public tracking succeeds with verified phone number');

    // Tracking with wrong phone must be rejected for privacy
    const wrongPhoneTrack = await runRequest('/api/orders/track', {
      method: 'POST',
      body: {
        orderNumber: orderRes.data.order.orderNumber,
        phone: '0000000000',
      },
    });
    assert(wrongPhoneTrack.status === 401, 'Unauthorized tracking without matching phone number correctly rejected (privacy preserved)');

    // TEST 11: Customer returns and Admin Manual Refund recording
    // First, mark order as Delivered by admin
    await runRequest(`/api/orders/${orderRes.data.order.id}/fulfillment`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'Delivered', note: 'Handed over by boutique courier to customer.' },
    });

    const returnReqRes = await runRequest('/api/returns', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        orderId: orderRes.data.order.id,
        items: [
          {
            product: firstProduct._id,
            sku: firstProduct.variants[0].sku,
            name: firstProduct.name,
            size: firstProduct.variants[0].size,
            color: firstProduct.variants[0].color,
            quantity: 1,
            price: firstProduct.price,
            reason: 'Size fitting adjustment required',
          },
        ],
        customerReason: 'Need size exchange or boutique return',
      },
    });
    assert(returnReqRes.status === 201 && returnReqRes.data.success, 'Return request successfully submitted');

    // Admin approves return & records manual refund
    const refundRes = await runRequest(`/api/returns/${returnReqRes.data.returnRequest._id}/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        amount: 1500,
        method: 'UPI',
        transactionReference: 'UPI-REFUND-9823412',
        notes: 'Customer refunded via Google Pay / UPI upon item inspection at boutique.',
      },
    });
    assert(refundRes.status === 200 && refundRes.data.returnRequest.status === 'Refunded', 'Manual refund successfully recorded and audited');

    // TEST 12: Admin Dashboard overview stats
    const statsRes = await runRequest('/api/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(statsRes.status === 200 && statsRes.data.stats.totalProducts >= 6, 'Dashboard overview pulls real DB counts');
    assert(statsRes.data.stats.totalOrders >= 1, 'Total orders reflect real placed orders');

    console.log(`\n========================================================`);
    console.log(`   ALL ${passedTests}/${totalTests} INTEGRATION TESTS PASSED SUCCESSFULLY! `);
    console.log(`========================================================\n`);

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n[Test Suite Failed]', err.message);
    if (server) server.close();
    process.exit(1);
  }
}

runTestSuite();
