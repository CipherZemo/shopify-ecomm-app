const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require("../controllers/orderController");

const router = express.Router();

// user routes
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

// admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id", protect, adminOnly, updateOrderStatus);

module.exports = router;
