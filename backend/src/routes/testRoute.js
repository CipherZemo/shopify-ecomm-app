const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// any logged-in user
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

// admin only
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome admin" });
});

module.exports = router;
