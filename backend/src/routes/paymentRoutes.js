const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { makePayment, getMyPayments } = require("../controllers/paymentController");

const router = express.Router();

router.use(protect);

router.post("/", makePayment);
router.get("/my", getMyPayments);

module.exports = router;
