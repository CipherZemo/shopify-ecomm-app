const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, getChat, } = require("../controllers/chatController");

const router = express.Router();

router.get("/", protect, getChat);  
// router.post("/message", protect, sendMessage);

module.exports = router;
