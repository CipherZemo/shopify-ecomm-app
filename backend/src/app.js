const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const socketUtil = require("./utils/socket");
socketUtil.init(io);

dotenv.config();
connectDB();


const app = express();
app.use(express.json());


app.use("/api/auth", require("./routes/authRoutes"));   
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

const server = http.createServer(app);

// socket setup
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to frontend URL
  },
});

require("./sockets")(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
