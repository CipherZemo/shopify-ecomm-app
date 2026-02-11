const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const socketUtil = require("./utils/socket");
const { Server } = require("socket.io");
const http = require("http");

dotenv.config();
connectDB();
const app = express();
// socket setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to frontend URL
  },
});
socketUtil.init(io);
require("./sockets")(io);

app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));   
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
