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

// 1. CORS - First
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static files - Simple and clean
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 4. Create HTTP server AFTER middleware
const server = http.createServer(app);

// 5. Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL ||  "http://localhost:5173",
    credentials: true
  },
});

// Initialize socket
socketUtil.init(io);
require("./sockets")(io);

// 6. API Routes - Last
app.use("/api/auth", require("./routes/authRoutes"));   
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// 7. Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { 
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Static files: ${path.join(__dirname, '../uploads')}`);
});