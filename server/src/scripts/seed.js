const mongoose = require('mongoose');
const { config } = require('../config/env');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const DeliveryZone = require('../models/DeliveryZone');
const Coupon = require('../models/Coupon');
const StoreSettings = require('../models/StoreSettings');

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected successfully.');

    // 1. Create or update Administrator
    console.log(`[Seed] Checking Admin account (${config.adminSeed.email})...`);
    let admin = await User.findOne({ email: config.adminSeed.email.toLowerCase() });
    if (!admin) {
      admin = await User.create({
        name: config.adminSeed.name,
        email: config.adminSeed.email.toLowerCase(),
        phone: config.adminSeed.phone,
        password: config.adminSeed.password,
        role: 'admin',
      });
      console.log(`[Seed] Created admin account: ${admin.email}`);
    } else {
      admin.role = 'admin';
      await admin.save();
      console.log(`[Seed] Admin account exists: ${admin.email}`);
    }

    // Also create a demo customer account for immediate testing
    const demoCustomerEmail = 'customer@example.com';
    let demoCustomer = await User.findOne({ email: demoCustomerEmail });
    if (!demoCustomer) {
      demoCustomer = await User.create({
        name: 'Pooja Hegde',
        email: demoCustomerEmail,
        phone: '9876543210',
        password: 'CustomerPass@2026',
        role: 'customer',
        addresses: [
          {
            fullName: 'Pooja Hegde',
            phone: '9876543210',
            addressLine: 'Flat 302, Palm Grove Apartments, Attavara',
            landmark: 'Near KMC Hospital',
            city: 'Mangalore',
            state: 'Karnataka',
            pincode: '575001',
            isDefault: true,
          },
        ],
      });
      console.log(`[Seed] Created demo customer account: ${demoCustomer.email} (Password: CustomerPass@2026)`);
    }

    // 2. Categories
    console.log('[Seed] Seeding product categories...');
    const categoriesData = [
      {
        name: 'Kurtas & Kurtis',
        slug: 'kurtas-and-kurtis',
        description: 'Bespoke hand-embroidered, printed and tailored designer kurtas for women.',
        displayOrder: 1,
        image: '/uploads/products/purple-embroidered-kurti.jpg',
      },
      {
        name: 'Festive & Bridal',
        slug: 'festive-and-bridal',
        description: 'Royal bridal lehengas, half-sarees, and opulent ethnic sets.',
        displayOrder: 2,
        image: '/uploads/products/royal-blue-lehenga.jpg',
      },
      {
        name: 'Dress Materials',
        slug: 'dress-materials',
        description: 'Unstitched Chanderi silk, cotton cambric, and tissue dress material sets.',
        displayOrder: 3,
        image: '/uploads/products/chanderi-dress-material.jpg',
      },
      {
        name: 'Pants & Palazzos',
        slug: 'pants-and-palazzos',
        description: 'Tailored straight-fit cigarette pants, palazzos, and Afghani trousers.',
        displayOrder: 4,
        image: '/uploads/products/ivory-embroidered-kurti.jpg',
      },
      {
        name: 'Leggings & Bottoms',
        slug: 'leggings',
        description: 'Super-combed 4-way stretch cotton churidars and ankle-length leggings.',
        displayOrder: 5,
        image: '/uploads/products/purple-embroidered-kurti.jpg',
      },
      {
        name: 'Nightwear & Loungewear',
        slug: 'nightwear',
        description: 'Breathable pure cotton nighties, kaftans, and relaxed lounge sets.',
        displayOrder: 6,
        image: '/uploads/products/ivory-mauve-lehenga.jpg',
      },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const savedCat = await Category.findOneAndUpdate({ slug: cat.slug }, cat, {
        upsert: true,
        new: true,
      });
      categoryMap[cat.slug] = savedCat._id;
    }

    // 3. Products
    console.log('[Seed] Seeding boutique products with size/colour inventory...');
    const productsData = [
      {
        name: 'Royal Purple Floral Hand-Embroidered Kurta Set',
        sku: 'JB-KUR-PURPLE-01',
        description:
          'Elegant deep purple straight kurta adorned with delicate handcrafted floral threadwork along the neckline and side panel. Paired with matching tailored straight-fit trousers for effortless festive elegance.',
        category: categoryMap['kurtas-and-kurtis'],
        productType: 'Ready-to-Wear',
        images: ['/uploads/products/purple-embroidered-kurti.jpg'],
        regularPrice: 2499,
        salePrice: 1999,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Royal Purple'],
        fabric: 'Pure Cotton Cambric with hand-embroidery',
        care: 'Dry clean recommended or gentle hand wash separately in cold water.',
        isFeatured: true,
        status: 'published',
        variants: [
          { sku: 'JB-KUR-PURPLE-01-S-PUR', size: 'S', color: 'Royal Purple', stock: 5, isAvailable: true },
          { sku: 'JB-KUR-PURPLE-01-M-PUR', size: 'M', color: 'Royal Purple', stock: 8, isAvailable: true },
          { sku: 'JB-KUR-PURPLE-01-L-PUR', size: 'L', color: 'Royal Purple', stock: 4, isAvailable: true },
          { sku: 'JB-KUR-PURPLE-01-XL-PUR', size: 'XL', color: 'Royal Purple', stock: 3, isAvailable: true },
          { sku: 'JB-KUR-PURPLE-01-XXL-PUR', size: 'XXL', color: 'Royal Purple', stock: 0, isAvailable: false }, // Demonstrates out of stock
        ],
      },
      {
        name: 'Ivory Floral Thread-Work Kurti with Pastel Borders',
        sku: 'JB-KUR-IVORY-02',
        description:
          'Breathtaking off-white textured kurti crafted with pastel blue and fawn threadwork across the split mandarin neck and hemline. Designed for contemporary ethnic daywear and boutique styling.',
        category: categoryMap['kurtas-and-kurtis'],
        productType: 'Ready-to-Wear',
        images: ['/uploads/products/ivory-embroidered-kurti.jpg'],
        regularPrice: 1899,
        salePrice: 1499,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Ivory White'],
        fabric: 'Textured Linen Blend with intricate embroidery',
        care: 'Gentle hand wash inside out. Dry in shade.',
        isFeatured: true,
        status: 'published',
        variants: [
          { sku: 'JB-KUR-IVORY-02-XS-IVO', size: 'XS', color: 'Ivory White', stock: 4, isAvailable: true },
          { sku: 'JB-KUR-IVORY-02-S-IVO', size: 'S', color: 'Ivory White', stock: 6, isAvailable: true },
          { sku: 'JB-KUR-IVORY-02-M-IVO', size: 'M', color: 'Ivory White', stock: 10, isAvailable: true },
          { sku: 'JB-KUR-IVORY-02-L-IVO', size: 'L', color: 'Ivory White', stock: 5, isAvailable: true },
          { sku: 'JB-KUR-IVORY-02-XL-IVO', size: 'XL', color: 'Ivory White', stock: 2, isAvailable: true },
        ],
      },
      {
        name: 'Royal Midnight Blue Embellished Silk Lehenga Choli',
        sku: 'JB-LEH-BLUE-03',
        description:
          'Showstopping midnight blue bridal & festive lehenga set featuring dense zari, sequins, and gota patti threadwork with traditional peacock motifs. Comes with a designer V-neck blouse and sheer net dupatta.',
        category: categoryMap['festive-and-bridal'],
        productType: 'Festive & Bridal',
        images: ['/uploads/products/royal-blue-lehenga.jpg'],
        regularPrice: 12999,
        salePrice: 9999,
        sizes: ['M', 'L', 'XL', 'Semi-Stitched'],
        colors: ['Midnight Blue'],
        fabric: 'Pure Silk Georgette & Tulle Net with Zari embroidery',
        care: 'Strictly dry clean only. Preserve in muslin wrap.',
        isFeatured: true,
        status: 'published',
        variants: [
          { sku: 'JB-LEH-BLUE-03-M-BLU', size: 'M', color: 'Midnight Blue', stock: 3, isAvailable: true },
          { sku: 'JB-LEH-BLUE-03-L-BLU', size: 'L', color: 'Midnight Blue', stock: 2, isAvailable: true },
          { sku: 'JB-LEH-BLUE-03-XL-BLU', size: 'XL', color: 'Midnight Blue', stock: 1, isAvailable: true },
          { sku: 'JB-LEH-BLUE-03-SEMI-BLU', size: 'Semi-Stitched', color: 'Midnight Blue', stock: 4, isAvailable: true },
        ],
      },
      {
        name: 'Ivory & Mauve Heritage Half-Saree Lehenga Set',
        sku: 'JB-LEH-MAUVE-04',
        description:
          'Exquisite ivory pleated flared lehenga skirt with metallic gold temple border detailing, paired with a fitted raw silk blouse and sheer lavender-mauve embroidered drape dupatta.',
        category: categoryMap['festive-and-bridal'],
        productType: 'Festive & Bridal',
        images: ['/uploads/products/ivory-mauve-lehenga.jpg'],
        regularPrice: 14500,
        salePrice: 11999,
        sizes: ['S', 'M', 'L', 'Semi-Stitched'],
        colors: ['Ivory & Mauve'],
        fabric: 'Tissue Silk & Chanderi Brocade',
        care: 'Dry clean only. Iron on reverse low heat.',
        isFeatured: true,
        status: 'published',
        variants: [
          { sku: 'JB-LEH-MAUVE-04-S-MAU', size: 'S', color: 'Ivory & Mauve', stock: 2, isAvailable: true },
          { sku: 'JB-LEH-MAUVE-04-M-MAU', size: 'M', color: 'Ivory & Mauve', stock: 4, isAvailable: true },
          { sku: 'JB-LEH-MAUVE-04-L-MAU', size: 'L', color: 'Ivory & Mauve', stock: 3, isAvailable: true },
          { sku: 'JB-LEH-MAUVE-04-SEMI-MAU', size: 'Semi-Stitched', color: 'Ivory & Mauve', stock: 3, isAvailable: true },
        ],
      },
      {
        name: 'Emerald Green Zardozi Silk Anarkali Suit Set',
        sku: 'JB-SUIT-GREEN-05',
        description:
          'Regal emerald green pure silk Anarkali suit set with heavy geometric zardozi threadwork on yoke and sleeve cuffs. Complemented with tapered silk churidar and matching border dupatta.',
        category: categoryMap['kurtas-and-kurtis'],
        productType: 'Ready-to-Wear',
        images: ['/uploads/products/emerald-green-anarkali.jpg'],
        regularPrice: 6499,
        salePrice: 5199,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Emerald Green'],
        fabric: 'Pure Raw Silk with Gold Zardozi',
        care: 'Dry clean only.',
        isFeatured: true,
        status: 'published',
        variants: [
          { sku: 'JB-SUIT-GREEN-05-S-GRN', size: 'S', color: 'Emerald Green', stock: 3, isAvailable: true },
          { sku: 'JB-SUIT-GREEN-05-M-GRN', size: 'M', color: 'Emerald Green', stock: 5, isAvailable: true },
          { sku: 'JB-SUIT-GREEN-05-L-GRN', size: 'L', color: 'Emerald Green', stock: 4, isAvailable: true },
          { sku: 'JB-SUIT-GREEN-05-XL-GRN', size: 'XL', color: 'Emerald Green', stock: 2, isAvailable: true },
        ],
      },
      {
        name: 'Mustard Chanderi Silk Unstitched Dress Material',
        sku: 'JB-DM-CHANDERI-06',
        description:
          'Designer unstitched dress material set with mustard yellow Chanderi silk kurta fabric (2.5m) featuring delicate zari butis, premium cotton bottom fabric (2.5m), and heavily bordered silk dupatta (2.4m).',
        category: categoryMap['dress-materials'],
        productType: 'Unstitched Material',
        images: ['/uploads/products/chanderi-dress-material.jpg'],
        regularPrice: 2299,
        salePrice: 1799,
        sizes: ['Unstitched Fabric Set'],
        colors: ['Mustard Gold'],
        fabric: 'Pure Chanderi Silk & Cotton',
        care: 'Dry clean first wash recommended.',
        isFeatured: true,
        status: 'published',
        variants: [
          { sku: 'JB-DM-CHANDERI-06-SET-GLD', size: 'Unstitched Fabric Set', color: 'Mustard Gold', stock: 12, isAvailable: true },
        ],
      },
    ];

    for (const prod of productsData) {
      await Product.findOneAndUpdate({ sku: prod.sku }, prod, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${productsData.length} boutique products.`);

    // 4. Delivery Zones
    console.log('[Seed] Seeding serviceable delivery PIN codes...');
    const deliveryZones = [
      { pincode: '575001', zoneName: 'Mangalore Central / Hampankatta', city: 'Mangalore', state: 'Karnataka', deliveryCharge: 0, estimatedDays: 'Same-day / 1 day', isServiceable: true, isApproved: true, isActive: true },
      { pincode: '575002', zoneName: 'Attavara Boutique Base', city: 'Mangalore', state: 'Karnataka', deliveryCharge: 0, estimatedDays: 'Same-day express', isServiceable: true, isApproved: true, isActive: true },
      { pincode: '575003', zoneName: 'Kadri & Mallikatta', city: 'Mangalore', state: 'Karnataka', deliveryCharge: 0, estimatedDays: '1 business day', isServiceable: true, isApproved: true, isActive: true },
      { pincode: '575004', zoneName: 'Bejai & Kuntikan', city: 'Mangalore', state: 'Karnataka', deliveryCharge: 0, estimatedDays: '1 business day', isServiceable: true, isApproved: true, isActive: true },
      { pincode: '575005', zoneName: 'Kankanady & Pumpwell', city: 'Mangalore', state: 'Karnataka', deliveryCharge: 0, estimatedDays: 'Same-day / 1 day', isServiceable: true, isApproved: true, isActive: true },
      { pincode: '575006', zoneName: 'Surathkal & NITK', city: 'Mangalore', state: 'Karnataka', deliveryCharge: 49, estimatedDays: '1 - 2 business days', isServiceable: true, isApproved: true, isActive: true },
      { pincode: '560001', zoneName: 'Bangalore Central', city: 'Bangalore', state: 'Karnataka', deliveryCharge: 99, estimatedDays: '2 - 3 business days', isServiceable: true, isApproved: true, isActive: true },
      { pincode: '570001', zoneName: 'Mysuru City', city: 'Mysuru', state: 'Karnataka', deliveryCharge: 99, estimatedDays: '2 - 4 business days', isServiceable: true, isApproved: true, isActive: true },
      { pincode: '400001', zoneName: 'Mumbai South', city: 'Mumbai', state: 'Maharashtra', deliveryCharge: 149, estimatedDays: '3 - 5 business days', isServiceable: true, isApproved: true, isActive: true },
      { pincode: '110001', zoneName: 'Delhi Central', city: 'New Delhi', state: 'Delhi', deliveryCharge: 199, estimatedDays: '4 - 6 business days', isServiceable: true, isApproved: true, isActive: true },
    ];

    for (const dz of deliveryZones) {
      await DeliveryZone.findOneAndUpdate({ pincode: dz.pincode }, dz, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${deliveryZones.length} delivery PIN code configurations.`);

    // 5. Coupons
    console.log('[Seed] Seeding promotional coupons...');
    const coupons = [
      {
        code: 'JASHVI10',
        description: '10% off on all boutique orders above ₹1,499',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 1499,
        maxDiscountAmount: 500,
        isActive: true,
      },
      {
        code: 'FIRSTBUY',
        description: 'Flat ₹200 off on your first boutique purchase above ₹999',
        discountType: 'flat',
        discountValue: 200,
        minOrderValue: 999,
        isActive: true,
      },
      {
        code: 'MANGALOREFESTIVE',
        description: '15% festive discount for orders above ₹2,999',
        discountType: 'percentage',
        discountValue: 15,
        minOrderValue: 2999,
        maxDiscountAmount: 1000,
        isActive: true,
      },
    ];

    for (const cp of coupons) {
      await Coupon.findOneAndUpdate({ code: cp.code }, cp, { upsert: true, new: true });
    }

    // 6. Store Settings
    console.log('[Seed] Initializing Boutique store settings...');
    await StoreSettings.findOneAndUpdate(
      {},
      {
        boutiqueName: 'Jashvi Boutique',
        tagline: "Mangalore's Premier Ladies' Ethnic Fashion & Bespoke Tailoring",
        phone: '8050853393',
        email: 'contact@jashviboutique.com',
        address: '#G1, Ground Floor, Bloom Residency, Victor Bishop Road, Attavara, Mangalore, Karnataka 575001',
        storeHours: '10:00 AM to 8:30 PM (Sunday Closed)',
        announcementBar: {
          text: 'Complimentary Boutique Delivery in Mangalore for orders above ₹1,999 | In-Store Tailoring Available',
          isActive: true,
        },
        returnPolicy: {
          windowDays: 7,
          policyText:
            'Eligible unworn ready-made clothing with original tags may be returned within 7 days of delivery. Tailored or customized items and unstitched fabrics cut to order are non-returnable. Refunds are processed upon inspection.',
          isConfigured: true,
        },
        freeShippingThreshold: 1999,
        allowCOD: true,
      },
      { upsert: true, new: true }
    );

    console.log('====================================================');
    console.log('  JASHVI BOUTIQUE - DATABASE SEEDING COMPLETE!      ');
    console.log('====================================================');
    console.log('Admin Account:    admin@jashviboutique.com');
    console.log('Admin Password:   JashviAdmin@2026!');
    console.log('Customer Account: customer@example.com');
    console.log('Customer Pass:    CustomerPass@2026');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
}

seedDatabase();
