const Chat = require("../models/Chat");
const chatbotService = require("../services/chatbotService");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("chatMessage", async ({ user, message }) => {
      await Chat.create({
        user: user._id,
        sender: "user",
        message,
      });

      const reply = await chatbotService.getBotReply(
        user,
        message
      );

      await Chat.create({
        user: user._id,
        sender: "bot",
        message: reply,
      });

      io.to(user._id.toString()).emit("chatReply", { reply });
    });
  });
};
