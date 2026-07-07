const express = require('express');
const Supplier = require('../models/Supplier');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const { page = 1, limit = 1000, search = '' } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const suppliers = await Supplier.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Supplier.countDocuments(query);

    res.json({
      success: true,
      data: suppliers,
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
    const code = req.body.code || 'SUP-' + Math.floor(1000 + Math.random() * 9000);
    const supplier = await Supplier.create({
      ...req.body,
      code,
    });
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    await Supplier.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;