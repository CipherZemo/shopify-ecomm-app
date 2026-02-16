const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const socketUtil = require("./utils/socket");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");

dotenv.config();
connectDB();


const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
// socket setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to frontend URL
  },
});

socketUtil.init(io);
require("./sockets")(io);

const helmet = require('helmet');
app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use("/api/auth", require("./routes/authRoutes"));   
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes")); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
