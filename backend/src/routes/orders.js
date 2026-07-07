const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const { page = 1, limit = 1000, orderType = '', status = '' } = req.query;
    let query = {};

    if (orderType) query.orderType = orderType;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('supplier', 'name code')
      .populate('items.product', 'name sku category price stock')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
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

router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const order = await Order.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = existingOrder.status;
    const newStatus = req.body.status;

    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('supplier', 'name code').populate('items.product', 'name sku');

    if (newStatus === 'Completed' && oldStatus !== 'Completed') {
      for (const item of order.items) {
        if (item.product) {
          const change = order.orderType === 'Purchase' ? item.quantity : -item.quantity;
          await Product.findByIdAndUpdate(item.product, {
            $inc: { 'stock.current': change }
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;