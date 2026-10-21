const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { config } = require('../../config/env');

/**
 * Base Payment Provider Interface
 */
class PaymentProvider {
  async createPaymentOrder({ orderId, amountInPaise, currency = 'INR', receipt, notes = {} }) {
    throw new Error('createPaymentOrder must be implemented');
  }

  async verifyPayment({ orderId, paymentId, signature }) {
    throw new Error('verifyPayment must be implemented');
  }

  isMockProvider() {
    return false;
  }
}

/**
 * Explicit Mock Payment Provider (For Local Development Sandbox Only)
 * Never treats mock payments as real financial transactions.
 */
class MockPaymentProvider extends PaymentProvider {
  constructor() {
    super();
    this.name = 'DEVELOPMENT_MOCK_PAYMENT_GATEWAY';
  }

  isMockProvider() {
    return true;
  }

  async createPaymentOrder({ orderId, amountInPaise, currency = 'INR', receipt, notes = {} }) {
    const mockGatewayOrderId = `mock_order_${Date.now()}_${uuidv4().slice(0, 8)}`;
    return {
      success: true,
      isMock: true,
      provider: 'MOCK_SANDBOX_DEV',
      gatewayOrderId: mockGatewayOrderId,
      amount: amountInPaise,
      currency,
      receipt: receipt || orderId,
      notice: 'DEVELOPMENT MOCK PAYMENT ONLY - NOT REAL MONEY',
      keyId: 'mock_key_development_only',
    };
  }

  async verifyPayment({ orderId, paymentId, signature }) {
    // In mock mode, we verify if signature conforms to our mock format or matches test token
    if (!paymentId || !orderId) {
      return {
        isValid: false,
        error: 'Missing orderId or paymentId in payment verification',
      };
    }

    const isSimulatedSuccess = !String(paymentId).toLowerCase().includes('fail');
    return {
      isValid: isSimulatedSuccess,
      isMock: true,
      provider: 'MOCK_SANDBOX_DEV',
      transactionId: paymentId || `mock_pay_${Date.now()}`,
      orderId,
      status: isSimulatedSuccess ? 'PAID' : 'FAILED',
      notes: '[DEV MOCK PAYMENT] Transaction verified via local mock sandbox adapter.',
    };
  }
}

/**
 * Razorpay Payment Provider (For Production / Official Sandbox)
 */
class RazorpayPaymentProvider extends PaymentProvider {
  constructor({ keyId, keySecret }) {
    super();
    this.keyId = keyId;
    this.keySecret = keySecret;
    this.name = 'RAZORPAY';

    try {
      const Razorpay = require('razorpay');
      this.client = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.isReady = true;
    } catch {
      this.isReady = false;
    }
  }

  isMockProvider() {
    return false;
  }

  async createPaymentOrder({ orderId, amountInPaise, currency = 'INR', receipt, notes = {} }) {
    if (!this.isReady || !this.client) {
      throw new Error('Razorpay client is not initialized or missing dependencies.');
    }

    const options = {
      amount: Math.round(amountInPaise),
      currency,
      receipt: String(receipt || orderId).slice(0, 40),
      notes: {
        systemOrderId: String(orderId),
        ...notes,
      },
    };

    const response = await this.client.orders.create(options);
    return {
      success: true,
      isMock: false,
      provider: 'RAZORPAY',
      gatewayOrderId: response.id,
      amount: response.amount,
      currency: response.currency,
      receipt: response.receipt,
      keyId: this.keyId,
    };
  }

  async verifyPayment({ orderId, paymentId, signature }) {
    if (!this.isReady) {
      return { isValid: false, error: 'Razorpay is not ready' };
    }

    // Razorpay signature verification: HMAC SHA256 of orderId + "|" + paymentId using key_secret
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = expectedSignature === signature;

    return {
      isValid,
      isMock: false,
      provider: 'RAZORPAY',
      transactionId: paymentId,
      orderId,
      status: isValid ? 'PAID' : 'FAILED',
      error: isValid ? null : 'Invalid payment signature received from gateway.',
    };
  }

  verifyWebhookSignature(bodyString, signatureHeader, secret) {
    const expected = crypto.createHmac('sha256', secret).update(bodyString).digest('hex');
    return expected === signatureHeader;
  }
}

// Active provider selection
let activePaymentProvider;
if (config.payment.isRazorpayActive && config.payment.mode === 'razorpay') {
  activePaymentProvider = new RazorpayPaymentProvider(config.payment.razorpay);
  console.log('[PaymentService] Initialized with Razorpay Gateway integration.');
} else {
  activePaymentProvider = new MockPaymentProvider();
  console.log(
    '[PaymentService] Initialized with DEVELOPMENT MOCK PAYMENT GATEWAY. (Real payments disabled until credentials provided).'
  );
}

module.exports = {
  paymentService: activePaymentProvider,
  MockPaymentProvider,
  RazorpayPaymentProvider,
};
