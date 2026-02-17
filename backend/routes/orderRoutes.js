const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { createOrder, cancelOrder, getMyOrders, getAllOrders, updateOrderStatus } = require("../controllers/orderController");

const router = express.Router();

// user routes
router.post("/", protect, createOrder);
router.put("/:id/cancel", protect, cancelOrder);
router.get("/my", protect, getMyOrders);

// admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id", protect, adminOnly, updateOrderStatus);

module.exports = router;
