const express = require("express");
const { getDashboardStats,getAllUsers,getUserDetails,getLowStockProducts,getOutOfStockProducts,getSalesReport } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);

// Inventory Management
router.get("/products/low-stock", getLowStockProducts);
router.get("/products/out-of-stock", getOutOfStockProducts);

// Reports
router.get("/reports/sales", getSalesReport);

module.exports = router;