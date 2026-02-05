const Wishlist = require("../models/Wishlist");

// get wishlist
exports.getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({
    user: req.user._id,
  }).populate("products");

  res.json(wishlist || { products: [] });
};

// add to wishlist
exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });
  } else if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.json(wishlist);
};

// remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return res.status(404).json({ message: "Wishlist not found" });
  }

  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== productId
  );

  await wishlist.save();
  res.json(wishlist);
};
