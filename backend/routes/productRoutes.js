const express = require("express");
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct,getCategories } = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// public routes
router.get("/", getProducts);
router.get("/categories", getCategories); 
router.get("/:id", getProductById);

// admin routes
router.post("/", protect, adminOnly, upload.array('images', 5), createProduct); 
router.put("/:id", protect, adminOnly, upload.array('images', 5), updateProduct); 
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
