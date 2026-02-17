const Order = require("../models/Order");
const Cart = require("../models/Cart");
const socketUtil = require("../utils/socket");
const Product = require("../models/Product");

// create order from cart
exports.createOrder = async (req, res) => {
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

const orderItems = cart.items.map((item) => {
  const originalPrice = item.product.price;
  const discount = item.product.discount || 0;
  const finalPrice = originalPrice - (originalPrice * discount / 100);
  
  return {
    product: item.product._id,
    name: item.product.name,
    price: finalPrice, // Use discounted price
    quantity: item.quantity,
  };
});

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
  });

    for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }

  cart.items = [];  // clear cart after order
  await cart.save();

  res.status(201).json(order);
};

//cancel order
exports.cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
      if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
  
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  if (order.status !== 'Pending') {
    return res.status(400).json({ 
      message: 'Can only cancel pending orders' 
    });
  }
  
  order.status = 'Cancelled';
  await order.save();
  
  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }
    });
  }
  
  res.json({ message: 'Order cancelled', order });
};

// get user orders
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
};

// admin: get all orders
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// admin: update order status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  const io = socketUtil.getIO();
  io.to(order.user.toString()).emit("orderStatusUpdate", {
    orderId: order._id,
    status: order.status,
  });

  res.json(order);
};
