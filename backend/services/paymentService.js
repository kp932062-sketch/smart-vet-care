// Payment Service for Razorpay Integration
const Razorpay = require('razorpay');

class PaymentService {
  constructor() {
    this.isInitialized = false;
    this.razorpay = null;
    
    // Check if Razorpay credentials are available
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      this.isInitialized = true;
      console.log('✅ Razorpay payment service initialized');
    } else {
      console.log('⚠️  Razorpay credentials not found - payments will be simulated');
      this.isInitialized = false;
    }
  }

  async createOrder(orderData) {
    if (!this.isInitialized) {
      // Simulate order creation
      const simulatedOrder = {
        id: `order_simulated_${Date.now()}`,
        entity: 'order',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt || `receipt_${Date.now()}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
        notes: orderData.notes || {}
      };
      
      console.log('💳 [SIMULATED] Razorpay order created:', simulatedOrder.id);
      return simulatedOrder;
    }

    const options = {
      amount: orderData.amount, // Already in paise
      currency: orderData.currency || 'INR',
      receipt: orderData.receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: orderData.notes || {}
    };
    
    return await this.razorpay.orders.create(options);
  }

  async verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
    if (!this.isInitialized) {
      // Simulate payment verification
      console.log('💳 [SIMULATED] Payment verification:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      return true; // Always return true for simulation
    }

    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    return generated_signature === razorpay_signature;
  }
}

module.exports = new PaymentService();