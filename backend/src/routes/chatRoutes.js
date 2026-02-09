const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getChatHistory,
} = require("../controllers/chatController");

const router = express.Router();

router.use(protect);

router.post("/", sendMessage);
router.get("/history", getChatHistory);

module.exports = router;
