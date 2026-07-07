const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'Please provide SKU'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Electronics', 'Clothing', 'Food', 'Hardware', 'Other'],
      default: 'Other',
    },
    price: {
      cost: {
        type: Number,
        default: 0,
      },
      selling: {
        type: Number,
        default: 0,
      },
    },
    stock: {
      current: {
        type: Number,
        default: 0,
      },
      minimum: {
        type: Number,
        default: 10,
      },
      maximum: {
        type: Number,
        default: 1000,
      },
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;