const Wishlist = require("../models/Wishlist");

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate("products");

    // ⭐ Return just the products array, not the whole wishlist object
    res.json({ products: wishlist?.products || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
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

    // ⭐ Populate products before returning
    await wishlist.populate("products");

    res.json({ products: wishlist.products || [] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );

    await wishlist.save();

    // ⭐ Populate products before returning
    await wishlist.populate("products");

    res.json({ products: wishlist.products || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};