import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // SKU
    sku: {
      type: String,
      required: [true, 'Please provide SKU'],
      unique: true,
      trim: true,
    },

    // Name
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },

    // Description
    description: {
      type: String,
      trim: true,
    },

    // Category
    category: {
      type: String,
      enum: ['Electronics', 'Clothing', 'Food', 'Hardware', 'Other'],
      default: 'Other',
    },

    // Pricing
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

    // Stock Management
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

    // Supplier (Optional)
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: false,  // ✅ Optional बनाया
    },

    // Created By
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Timestamps
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

export default Product;