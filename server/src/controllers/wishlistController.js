const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * Get customer wishlist
 */
async function getWishlist(req, res, next) {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      match: { isArchived: false, status: 'published' },
      populate: { path: 'category', select: 'name slug' },
    });

    res.json({
      success: true,
      products: wishlist ? wishlist.products : [],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle item in wishlist (Add / Remove)
 */
async function toggleWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
      wishlist.products.splice(index, 1);
      isAdded = false;
    } else {
      wishlist.products.push(productId);
      isAdded = true;
    }

    await wishlist.save();

    res.json({
      success: true,
      isAdded,
      message: isAdded ? 'Added to your Wishlist!' : 'Removed from Wishlist',
      productsCount: wishlist.products.length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWishlist,
  toggleWishlist,
};
