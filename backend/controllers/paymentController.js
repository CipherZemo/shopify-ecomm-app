const Payment = require("../models/Payment");
const Order = require("../models/Order");
const razorpayInstance = require("../config/razorpay");
const crypto = require("crypto");

/**
 * Step 1: Create Razorpay Order
 * Called when user clicks "Pay Now" button
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get the order from database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify order belongs to logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order is already paid
    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Order already processed" });
    }

    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(order.totalAmount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    // Save payment record in database
    const payment = await Payment.create({
      user: req.user._id,
      order: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: "INR",
      status: "Created",
    });

    // Send Razorpay order details to frontend
    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Frontend needs this
      payment: payment,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Step 2: Verify Payment Signature
 * Called after user completes payment on Razorpay checkout
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Verify signature to ensure payment is genuine
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature === razorpaySignature) {
      // ✅ Payment verified successfully

      // Update payment record
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = "Success";
      await payment.save();

      // Update order status
      const order = await Order.findById(payment.order);
      order.status = "Payment Success";
      await order.save();

      res.json({
        success: true,
        message: "Payment verified successfully",
        payment,
        order,
      });
    } else {
      // ❌ Signature mismatch - payment is fraudulent or tampered
      payment.status = "Failed";
      await payment.save();

      res.status(400).json({
        success: false,
        message: "Payment verification failed - Invalid signature",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Step 3: Handle Payment Failure
 * Called if user cancels or payment fails
 */
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { razorpayOrderId, error } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Update payment status to failed
    payment.status = "Failed";
    await payment.save();

    res.json({
      success: false,
      message: "Payment failed",
      error: error,
    });
  } catch (error) {
    console.error("Payment failure handling error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user's payment history
 */
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("order")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single payment details
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("order")
      .populate("user", "name email");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check authorization
    if (
      payment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};