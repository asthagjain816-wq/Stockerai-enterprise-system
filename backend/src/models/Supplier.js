const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: null,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    contact: {
      person: String,
      title: String,
      email: String,
      phone: String,
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      accountHolderName: String,
    },
    paymentTerms: {
      type: String,
      enum: ['Net 30', 'Net 60', 'Net 90', 'Immediate', 'Custom'],
      default: 'Net 30',
    },
    paymentMethods: [
      {
        type: String,
        enum: ['Bank Transfer', 'Credit Card', 'Check', 'Cash'],
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    outstandingBalance: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Paid',
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: Number,
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    categories: [String],
    leadTime: {
      type: Number,
      default: 7,
    },
    minimumOrder: {
      type: Number,
      default: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    volume: {
      annualOrders: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
    },
    documents: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    certifications: [
      {
        name: String,
        certificationNumber: String,
        expiryDate: Date,
        document: String,
      },
    ],
    performanceMetrics: {
      onTimeDeliveryRate: {
        type: Number,
        default: 100,
      },
      qualityScore: {
        type: Number,
        default: 100,
      },
      responseTime: {
        type: Number,
        default: 24,
      },
      lastOrderDate: Date,
      totalOrders: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

supplierSchema.index({ name: 'text', code: 'text', email: 'text' });
supplierSchema.index({ isActive: 1 });

supplierSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = sum / this.reviews.length;
  }
  return this.rating;
};

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
