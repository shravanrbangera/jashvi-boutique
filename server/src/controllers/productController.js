const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const AdminAuditLog = require('../models/AdminAuditLog');
const { storageService } = require('../services/storage/storageService');

/**
 * Get all published products with search, filters, and sorting
 */
async function getProducts(req, res, next) {
  try {
    const {
      search,
      category,
      categorySlug,
      minPrice,
      maxPrice,
      size,
      color,
      sort,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Customers only see published, unarchived products
    // Admin can filter by status if requested
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      filter.status = 'published';
      filter.isArchived = false;
    } else if (status) {
      filter.status = status;
    }

    // Category filter by ID or Slug
    if (category) {
      filter.category = category;
    } else if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug.toLowerCase() });
      if (cat) {
        filter.category = cat._id;
      }
    }

    // Keyword search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fabric: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Size filter
    if (size) {
      filter.sizes = size;
    }

    // Color filter
    if (color) {
      filter.colors = color;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.regularPrice = {};
      if (minPrice) filter.regularPrice.$gte = Number(minPrice);
      if (maxPrice) filter.regularPrice.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sort === 'price-low') {
      sortOptions = { regularPrice: 1 };
    } else if (sort === 'price-high') {
      sortOptions = { regularPrice: -1 };
    } else if (sort === 'name-asc') {
      sortOptions = { name: 1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get featured products for homepage
 */
async function getFeaturedProducts(req, res, next) {
  try {
    const products = await Product.find({
      status: 'published',
      isArchived: false,
      isFeatured: true,
    })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single product by ID
 */
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug description');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // If archived or draft and not admin, return 404
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && (product.isArchived || product.status !== 'published')) {
      return res.status(404).json({
        success: false,
        message: 'This product is currently unavailable.',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all active categories
 */
async function getCategories(req, res, next) {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = isAdmin ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });
    res.json({
      success: true,
      categories,
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------------
// ADMIN PRODUCT & INVENTORY OPERATIONS
// ------------------------------------------------------------------------

/**
 * Admin: Create a new product
 */
async function createProduct(req, res, next) {
  try {
    const {
      name,
      sku,
      description,
      category,
      productType,
      images,
      regularPrice,
      salePrice,
      sizes,
      colors,
      fabric,
      care,
      variants,
      isFeatured,
      status,
    } = req.body;

    if (!name || !sku || !regularPrice || !category || !images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU, Category, Regular Price, and at least one Image are required.',
      });
    }

    // Auto-generate variants if none provided explicitly
    let finalVariants = variants;
    if (!finalVariants || finalVariants.length === 0) {
      const parsedSizes = sizes && sizes.length > 0 ? sizes : ['Free Size'];
      const parsedColors = colors && colors.length > 0 ? colors : ['Standard'];
      finalVariants = [];

      for (const s of parsedSizes) {
        for (const c of parsedColors) {
          finalVariants.push({
            sku: `${sku.toUpperCase()}-${s.replace(/\s+/g, '')}-${c.replace(/\s+/g, '')}`,
            size: s,
            color: c,
            stock: 5, // initial default
            isAvailable: true,
          });
        }
      }
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      description,
      category,
      productType: productType || 'Ready-to-Wear',
      images,
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : null,
      sizes: sizes || ['Free Size'],
      colors: colors || ['Standard'],
      fabric: fabric || 'Premium Boutique Fabric',
      care: care || 'Dry clean recommended or gentle hand wash separately in cold water.',
      variants: finalVariants,
      isFeatured: Boolean(isFeatured),
      status: status || 'published',
    });

    // Record audit log
    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product._id.toString(),
      details: `Created product "${name}" (SKU: ${sku.toUpperCase()}) with ${finalVariants.length} variants.`,
      newState: { regularPrice, salePrice, stock: product.totalStock },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update product details
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousSnapshot = {
      name: product.name,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      status: product.status,
    };

    // Note: Price modifications must be audited specifically if changed
    const fields = [
      'name',
      'description',
      'category',
      'productType',
      'images',
      'sizes',
      'colors',
      'fabric',
      'care',
      'isFeatured',
      'status',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    // Price updates via standard edit
    if (req.body.regularPrice !== undefined) product.regularPrice = Number(req.body.regularPrice);
    if (req.body.salePrice !== undefined) {
      product.salePrice = req.body.salePrice ? Number(req.body.salePrice) : null;
    }

    if (req.body.variants) {
      product.variants = req.body.variants;
    }

    await product.save();

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: product._id.toString(),
      details: `Updated product details for "${product.name}"`,
      previousState: previousSnapshot,
      newState: {
        name: product.name,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        status: product.status,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Controlled price adjustment with audit logging
 */
async function updatePrice(req, res, next) {
  try {
    const { id } = req.params;
    const { regularPrice, salePrice, reason } = req.body;

    if (!regularPrice || Number(regularPrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid regular price is required',
      });
    }

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'A reason for modifying product price is mandatory for audit compliance.',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const oldRegular = product.regularPrice;
    const oldSale = product.salePrice;

    product.regularPrice = Number(regularPrice);
    product.salePrice = salePrice ? Number(salePrice) : null;

    await product.save();

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'PRICE_CHANGE',
      entityType: 'Product',
      entityId: product._id.toString(),
      details: `Price modified for "${product.name}". Reason: ${reason}`,
      previousState: { regularPrice: oldRegular, salePrice: oldSale },
      newState: { regularPrice: product.regularPrice, salePrice: product.salePrice },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Product price updated and audit log recorded.',
      product,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update stock for specific variant
 */
async function updateInventory(req, res, next) {
  try {
    const { id, variantId } = req.params;
    const { stock, isAvailable, reason } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    const oldStock = variant.stock;
    if (stock !== undefined) variant.stock = Math.max(0, Number(stock));
    if (isAvailable !== undefined) variant.isAvailable = Boolean(isAvailable);

    await product.save();

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'INVENTORY_ADJUSTED',
      entityType: 'Inventory',
      entityId: `${id}:${variantId}`,
      details: `Inventory for SKU ${variant.sku} adjusted from ${oldStock} to ${variant.stock}. Reason: ${
        reason || 'Manual Admin Inventory Update'
      }`,
      previousState: { stock: oldStock },
      newState: { stock: variant.stock, isAvailable: variant.isAvailable },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Inventory updated successfully.',
      variant,
      totalStock: product.totalStock,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Archive product (preserves historical order consistency)
 */
async function archiveProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isArchived = true;
    product.status = 'archived';
    await product.save();

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'PRODUCT_ARCHIVED',
      entityType: 'Product',
      entityId: id,
      details: `Product "${product.name}" archived to preserve historical order records.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Product archived successfully. Historical orders will not be affected.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Permanently delete a garment from the catalogue
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const productName = product.name;
    const productSku = product.sku;

    await Product.findByIdAndDelete(id);

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'PRODUCT_DELETED',
      entityType: 'Product',
      entityId: id,
      details: `Product "${productName}" (SKU: ${productSku}) permanently deleted by administrator.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Product "${productName}" has been permanently deleted from catalogue.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Upload image via active storage adapter (Local / Cloudinary)
 */
async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const result = await storageService.saveFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'products'
    );

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl: result.publicUrl,
      provider: result.provider,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Category Operations
 */
async function createCategory(req, res, next) {
  try {
    const { name, slug, description, image, displayOrder } = req.body;
    const cat = await Category.create({
      name,
      slug: (slug || name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description,
      image,
      displayOrder: Number(displayOrder) || 0,
    });

    res.status(201).json({ success: true, category: cat });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const cat = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.json({ success: true, category: cat });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${productCount} products are assigned to it. Move or archive them first.`,
      });
    }

    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: 'Category removed.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  updatePrice,
  updateInventory,
  archiveProduct,
  deleteProduct,
  uploadImage,
  createCategory,
  updateCategory,
  deleteCategory,
};
