const Cart = require("../models/Cart");
const Product = require("../models/Product");

// get user cart
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );
  res.json(cart || { items: [] });
};

// add/update item
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Check stock
  if (quantity > product.stock) {
    return res.status(400).json({ 
      message: `Only ${product.stock} items available in stock` 
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity }],
    });
  } else {
    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (item) {
      item.quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
  }

  // ⭐ IMPORTANT: Populate before returning
  await cart.populate("items.product");

  res.json(cart);
};

// remove item
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== productId
  );

  await cart.save();
  
  // ⭐ IMPORTANT: Populate before returning
  await cart.populate("items.product");
  
  res.json(cart);
};