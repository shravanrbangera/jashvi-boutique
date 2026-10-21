const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    sku: {
      type: String,
      required: [true, 'Base product SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    productType: {
      type: String,
      trim: true,
      default: 'Ready-to-Wear',
      enum: ['Ready-to-Wear', 'Unstitched Material', 'Festive & Bridal', 'Co-ord Set', 'Essentials'],
    },
    images: {
      type: [String],
      validate: [
        (val) => val.length > 0,
        'At least one product image is required',
      ],
    },
    regularPrice: {
      type: Number,
      required: [true, 'Regular price in INR is required'],
      min: [0, 'Price must be positive'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price must be positive'],
      default: null,
      validate: {
        validator: function (val) {
          if (val === null || val === undefined) return true;
          return val < this.regularPrice;
        },
        message: 'Sale price must be less than regular price',
      },
    },
    sizes: {
      type: [String],
      default: ['Free Size'],
    },
    colors: {
      type: [String],
      default: ['Standard'],
    },
    fabric: {
      type: String,
      trim: true,
      default: 'Premium Boutique Fabric',
    },
    care: {
      type: String,
      trim: true,
      default: 'Dry clean recommended or gentle hand wash separately in cold water.',
    },
    variants: [variantSchema],
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total stock across all variants
productSchema.virtual('totalStock').get(function () {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
});

// Virtual for effective selling price
productSchema.virtual('price').get(function () {
  return this.salePrice && this.salePrice > 0 ? this.salePrice : this.regularPrice;
});

// Indexing for search and category filtering
productSchema.index({ name: 'text', description: 'text', fabric: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ isFeatured: 1, status: 1 });

module.exports = mongoose.model('Product', productSchema);
