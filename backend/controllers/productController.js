const Product = require("../models/Product");
const fs = require('fs');
const path = require('path');

// CREATE product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, discount, stock, category } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

    const product = await Product.create({ name, description, price, discount: discount || 0, stock, category, images });
res.status(201).json(product);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET all products (Public)
exports.getProducts = async (req, res) => {
  try {
    // Extract query parameters
    const {
      search,        // Search by product name
      category,      // Filter by category
      minPrice,      // Filter by minimum price
      maxPrice,      // Filter by maximum price
      inStock,       // Filter: only in-stock products
      sort,          // Sort option
      page = 1,      // Page number (default: 1)
      limit = 12     // Items per page (default: 12) 
      } = req.query;

    // Build query object
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' }; //SEARCH by name (case-insensitive)
    }
    if (category) {
      query.category = category;//FILTER by category
    }
    if (minPrice || maxPrice) { //FILTER by price range
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (inStock === 'true') {
      query.stock = { $gt: 0 }; //FILTER by stock availability
    }


    // 5. SORT options
    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'name_asc') sortOption.name = 1;
    else if (sort === 'name_desc') sortOption.name = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else if (sort === 'oldest') sortOption.createdAt = 1;
    else sortOption.createdAt = -1; // Default: newest first

    // 6. PAGINATION
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limitNum)
      .skip(skip);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET single product (Public)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, discount, stock, category } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle new images if uploaded
    let images = product.images; // Keep existing images by default
    
    if (req.files && req.files.length > 0) {
      // Delete old images from filesystem
      product.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '../../', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });

      // Set new images
      images = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.discount = discount !== undefined ? discount : product.discount;
    product.stock = stock || product.stock;
    product.category = category || product.category;
    product.images = images;

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE product (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from filesystem
    product.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '../../', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all categories (Public)
exports.getCategories = async (req, res) => {
  try {
    // Get distinct categories from all products
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
