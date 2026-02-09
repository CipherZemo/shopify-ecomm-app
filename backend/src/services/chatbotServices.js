const Order = require("../models/Order");
const Product = require("../models/Product");

/**
 * Normalize user message:
 * - lowercase
 * - trim spaces
 */
const normalize = (text) => text.toLowerCase().trim();

exports.getBotReply = async (user, message) => {
  const text = normalize(message);

  /* ------------------------------
     GREETINGS
  ------------------------------ */
  if (["hi", "hello", "hey"].includes(text)) {
    return "Hello 👋 How can I help you today?";
  }

  /* ------------------------------
     HELP
  ------------------------------ */
  if (text === "help") {
    return (
      "I can help you with:\n" +
      "• Order status\n" +
      "• Your recent orders\n" +
      "• Available products\n\n" +
      "Try asking:\n" +
      "- Where is my order?\n" +
      "- Show my orders\n" +
      "- Show products"
    );
  }

  /* ------------------------------
     ORDER STATUS
  ------------------------------ */
  if (
    text.includes("order status") ||
    text.includes("where is my order")
  ) {
    const order = await Order.findOne({ user: user._id }).sort({
      createdAt: -1,
    });

    if (!order) {
      return "You don’t have any orders yet.";
    }

    return `Your latest order is currently "${order.status}".`;
  }

  /* ------------------------------
     MY ORDERS
  ------------------------------ */
  if (
    text.includes("my orders") ||
    text.includes("show my orders")
  ) {
    const orders = await Order.find({ user: user._id }).limit(3);

    if (orders.length === 0) {
      return "You have not placed any orders yet.";
    }

    return (
      "Here are your recent orders:\n" +
      orders
        .map(
          (o) =>
            `• Order ${o._id.toString().slice(-6)} - ${o.status}`
        )
        .join("\n")
    );
  }

  /* ------------------------------
     PRODUCTS
  ------------------------------ */
  if (
    text.includes("products") ||
    text.includes("show products")
  ) {
    const products = await Product.find().limit(5);

    if (products.length === 0) {
      return "No products are available right now.";
    }

    return (
      "Here are some products:\n" +
      products.map((p) => `• ${p.name}`).join("\n")
    );
  }

  /* ------------------------------
     FALLBACK (UNKNOWN QUESTION)
  ------------------------------ */
  return (
    "Sorry, I didn’t understand that ❓\n" +
    "Type *help* to see what I can assist you with."
  );
};
