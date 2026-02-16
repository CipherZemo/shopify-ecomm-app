const Chat = require("../models/Chat");
const chatbotService = require("../services/chatbotService");

exports.sendMessage = async (req, res) => {
  const { message } = req.body;

  // Save user message
  await Chat.create({
    user: req.user._id,
    sender: "user",
    message,
  });

  // Get bot reply
  const reply = await chatbotService.getBotReply(
    req.user,
    message
  );

  // Save bot reply
  await Chat.create({
    user: req.user._id,
    sender: "bot",
    message: reply,
  });

  res.json({ reply });
};

exports.getChatHistory = async (req, res) => {
  const chats = await Chat.find({ user: req.user._id }).sort({
    createdAt: 1,
  });

  res.json(chats);
};
