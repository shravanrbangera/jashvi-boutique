const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const { config } = require('../config/env');

// Set cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * Register a new customer
 */
async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and password.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'customer',
    });

    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Jashvi Boutique.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login customer or admin
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout
 */
function logout(req, res) {
  res.clearCookie('token', getCookieOptions());
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

/**
 * Get current profile
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update profile details
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add delivery address
 */
async function addAddress(req, res, next) {
  try {
    const { fullName, phone, addressLine, landmark, city, state, pincode, isDefault } = req.body;

    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields.',
      });
    }

    const user = await User.findById(req.user.id);

    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({
      fullName,
      phone,
      addressLine,
      landmark: landmark || '',
      city,
      state,
      pincode,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      addresses: user.addresses,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete delivery address
 */
async function deleteAddress(req, res, next) {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted.',
      addresses: user.addresses,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Forgot password simulation / token generation
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Safe response even if user not found to prevent user enumeration
    res.json({
      success: true,
      message:
        'If an account exists with that email, instructions to reset your password have been generated.',
      simulatedNotice:
        'For boutique security, password resets are processed via verified customer communication.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  forgotPassword,
};
