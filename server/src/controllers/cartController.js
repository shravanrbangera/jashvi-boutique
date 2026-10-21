const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Helper to recalculate cart pricing & check stock availability dynamically from Product DB
 */
async function buildRecalculatedCart(cart) {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      id: cart ? cart._id : null,
      items: [],
      subtotal: 0,
      itemCount: 0,
      hasStockIssues: false,
    };
  }

  const populatedItems = [];
  let subtotal = 0;
  let itemCount = 0;
  let hasStockIssues = false;

  for (const item of cart.items) {
    const product = await Product.findById(item.product).populate('category', 'name slug');

    if (!product || product.isArchived || product.status !== 'published') {
      // Product no longer available
      hasStockIssues = true;
      continue;
    }

    const variant = product.variants.find((v) => v.sku === item.variantSku) ||
      product.variants.find((v) => v.size === item.size && v.color === item.color) ||
      product.variants[0];

    const currentStock = variant ? variant.stock : 0;
    const isOutOfStock = currentStock <= 0;
    const isQuantityExceeded = item.quantity > currentStock;

    if (isOutOfStock || isQuantityExceeded) {
      hasStockIssues = true;
    }

    const currentUnitPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice;
    const effectiveQty = isOutOfStock ? 0 : Math.min(item.quantity, currentStock);
    const lineTotal = currentUnitPrice * effectiveQty;

    subtotal += lineTotal;
    itemCount += item.quantity;

    populatedItems.push({
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        image: product.images[0] || '',
        category: product.category,
      },
      variantSku: variant ? variant.sku : item.variantSku,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: currentUnitPrice,
      regularPrice: product.regularPrice,
      lineTotal,
      currentStock,
      isOutOfStock,
      isQuantityExceeded,
    });
  }

  return {
    id: cart._id,
    items: populatedItems,
    subtotal,
    itemCount,
    hasStockIssues,
  };
}

/**
 * Get active cart
 */
async function getCart(req, res, next) {
  try {
    const userId = req.user ? req.user._id : null;
    const guestId = req.headers['x-guest-id'] || req.query.guestId;

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart) {
      return res.json({
        success: true,
        cart: { items: [], subtotal: 0, itemCount: 0, hasStockIssues: false },
      });
    }

    const recalculated = await buildRecalculatedCart(cart);
    res.json({
      success: true,
      cart: recalculated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add item to cart
 */
async function addToCart(req, res, next) {
  try {
    const { productId, size, color, quantity = 1 } = req.body;
    const userId = req.user ? req.user._id : null;
    const guestId = req.headers['x-guest-id'] || req.body.guestId;

    if (!productId || !size || !color) {
      return res.status(400).json({
        success: false,
        message: 'Product, size, and colour selection are required.',
      });
    }

    const product = await Product.findById(productId);
    if (!product || product.isArchived || product.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Product is not available for purchase.' });
    }

    // Match variant
    const variant = product.variants.find(
      (v) => v.size.toLowerCase() === size.toLowerCase() && v.color.toLowerCase() === color.toLowerCase()
    ) || product.variants[0];

    if (!variant || variant.stock < 1) {
      return res.status(400).json({
        success: false,
        message: `The selected option (${size} / ${color}) is currently out of stock.`,
      });
    }

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
      if (!cart) cart = new Cart({ user: userId, items: [] });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
      if (!cart) cart = new Cart({ guestId, items: [] });
    } else {
      return res.status(400).json({ success: false, message: 'User or Guest identification required.' });
    }

    // Check if variant already in cart
    const existingIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId && i.size === size && i.color === color
    );

    const qtyToAdd = Math.max(1, Number(quantity));

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qtyToAdd;
      if (newQty > variant.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stock} units available in stock for this variant.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      if (qtyToAdd > variant.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stock} units available in stock.`,
        });
      }
      cart.items.push({
        product: product._id,
        variantSku: variant.sku,
        size,
        color,
        quantity: qtyToAdd,
      });
    }

    await cart.save();
    const recalculated = await buildRecalculatedCart(cart);

    res.json({
      success: true,
      message: `${product.name} (${size}) added to your shopping bag!`,
      cart: recalculated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update item quantity in cart
 */
async function updateCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user ? req.user._id : null;
    const guestId = req.headers['x-guest-id'] || req.query.guestId;

    const filter = userId ? { user: userId } : { guestId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const newQty = Number(quantity);
    if (newQty <= 0) {
      cart.items.pull(itemId);
    } else {
      // Check stock limit
      const product = await Product.findById(item.product);
      if (product) {
        const variant = product.variants.find((v) => v.sku === item.variantSku);
        if (variant && newQty > variant.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot exceed available stock (${variant.stock} units).`,
          });
        }
      }
      item.quantity = newQty;
    }

    await cart.save();
    const recalculated = await buildRecalculatedCart(cart);

    res.json({
      success: true,
      cart: recalculated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove item from cart
 */
async function removeCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const userId = req.user ? req.user._id : null;
    const guestId = req.headers['x-guest-id'] || req.query.guestId;

    const filter = userId ? { user: userId } : { guestId };
    const cart = await Cart.findOne(filter);

    if (cart) {
      cart.items.pull(itemId);
      await cart.save();
    }

    const recalculated = await buildRecalculatedCart(cart);
    res.json({
      success: true,
      message: 'Item removed from bag.',
      cart: recalculated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Merge guest cart into user cart upon login
 */
async function mergeGuestCart(req, res, next) {
  try {
    const { guestId } = req.body;
    const userId = req.user._id;

    if (!guestId) {
      return res.json({ success: true, message: 'No guest cart to merge.' });
    }

    const guestCart = await Cart.findOne({ guestId });
    if (!guestCart || guestCart.items.length === 0) {
      return res.json({ success: true, message: 'Guest cart empty.' });
    }

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = new Cart({ user: userId, items: [] });
    }

    for (const gItem of guestCart.items) {
      const existing = userCart.items.find(
        (i) =>
          i.product.toString() === gItem.product.toString() &&
          i.size === gItem.size &&
          i.color === gItem.color
      );
      if (existing) {
        existing.quantity += gItem.quantity;
      } else {
        userCart.items.push(gItem);
      }
    }

    await userCart.save();
    await Cart.deleteOne({ _id: guestCart._id });

    const recalculated = await buildRecalculatedCart(userCart);
    res.json({
      success: true,
      message: 'Guest shopping bag merged with your account bag.',
      cart: recalculated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  mergeGuestCart,
};
