const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

/**
 * GET DASHBOARD STATISTICS
 * Overview stats for admin dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Users (excluding admins)
    const totalUsers = await User.countDocuments({ role: 'user' });

    // 2. Total Products
    const totalProducts = await Product.countDocuments();

    // 3. Total Orders
    const totalOrders = await Order.countDocuments();

    // 4. Total Revenue (only from successful payments)
    const revenueData = await Payment.aggregate([
      { 
        $match: { status: 'Success' } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 5. Pending Orders
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    // 6. Low Stock Products (stock < 10)
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    // 7. Out of Stock Products
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    // 8. Recent Orders (last 5)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id user totalAmount status createdAt');

    // 9. Order Status Breakdown
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 10. Revenue by Month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // 11. Top Selling Products (by quantity sold)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 1,
          name: '$productDetails.name',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
        outOfStockProducts
      },
      recentOrders,
      ordersByStatus,
      revenueByMonth,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL USERS
 * List all users with pagination and search
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = { role: 'user' }; // Exclude admins

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      users,
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

/**
 * GET USER DETAILS
 * Get single user with their order history
 */
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's orders
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's total spending
    const spendingData = await Payment.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'order',
          foreignField: '_id',
          as: 'orderDetails'
        }
      },
      { $unwind: '$orderDetails' },
      {
        $match: {
          'orderDetails.user': user._id,
          status: 'Success'
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const totalSpent = spendingData.length > 0 ? spendingData[0].totalSpent : 0;

    res.json({
      user,
      orders,
      totalOrders: orders.length,
      totalSpent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET LOW STOCK PRODUCTS
 * Products with stock less than threshold
 */
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const products = await Product.find({
      stock: { $lt: parseInt(threshold), $gt: 0 }
    }).sort({ stock: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET OUT OF STOCK PRODUCTS
 */
exports.getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: 0 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SALES REPORT
 * Detailed sales report with date range
 */
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Total sales
    const salesData = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$amount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Sales by category
    const salesByCategory = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Daily sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          sales: { $sum: '$amount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      summary: salesData.length > 0 ? salesData[0] : { totalSales: 0, totalOrders: 0 },
      salesByCategory,
      dailySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};