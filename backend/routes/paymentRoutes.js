const express = require("express");
const {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  getMyPayments,
  getPaymentDetails,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes
router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);
router.post("/failure", protect, handlePaymentFailure);
router.get("/my-payments", protect, getMyPayments);
router.get("/:id", protect, getPaymentDetails);

module.exports = router;