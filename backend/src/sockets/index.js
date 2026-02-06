module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // join user-specific room
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // chat message
    socket.on("chatMessage", (data) => {
      const { userId, message } = data;

      io.to(userId).emit("chatReply", {
        reply: `You said: ${message}`,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
