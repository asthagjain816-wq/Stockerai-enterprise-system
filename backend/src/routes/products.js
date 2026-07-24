const express = require('express');
const Product = require('../models/Product');
const { isAuthenticated } = require('../middleware/authMiddleware');

const { seedDatabase } = require('../utils/seeder');

const router = express.Router();

router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const count = await Product.countDocuments({ isActive: true });
    if (count < 5) {
      await seedDatabase(req.user._id);
    }

    const { page = 1, limit = 1000, search = '', category = '' } = req.query;
    
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/low-stock/alert', isAuthenticated, async (req, res, next) => {
  try {
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock.current', '$stock.minimum'] },
    }).limit(10);

    res.json({ success: true, data: lowStockProducts });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Inventory item deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/export/csv', isAuthenticated, async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true });
    
    let csv = 'SKU,Name,Category,Cost Price,Selling Price,Current Stock,Minimum Stock\n';
    
    products.forEach((p) => {
      csv += `${p.sku},"${p.name}",${p.category},${p.price.cost},${p.price.selling},${p.stock.current},${p.stock.minimum}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

module.exports = router;