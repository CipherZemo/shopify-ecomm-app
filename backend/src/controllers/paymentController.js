const Payment = require("../models/Payment");
const Order = require("../models/Order");

// mock payment
exports.makePayment = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // mock success (later replaced by real gateway logic)
  const paymentSuccess = true;

  const payment = await Payment.create({
    user: req.user._id,
    order: order._id,
    paymentId: "PAY_" + Date.now(),
    amount: order.totalAmount,
    status: paymentSuccess ? "Success" : "Failed",
  });

  if (paymentSuccess) {
    order.status = "Payment Success";
    await order.save();
  }

  res.json({
    message: "Payment processed",
    payment,
  });
};

// get user payments
exports.getMyPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate("order")
    .sort({ createdAt: -1 });

  res.json(payments);
};
