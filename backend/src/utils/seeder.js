const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');

const seedDatabase = async (userId) => {
  try {
    if (!userId) {
      const defaultUser = await User.findOne();
      if (!defaultUser) return;
      userId = defaultUser._id;
    }

    console.log(`🌱 Seeding database with premium enterprise dataset for user: ${userId}`);

    // 1. Create default suppliers
    await Supplier.deleteMany({});
    const suppliers = await Supplier.insertMany([
      { name: 'Apex Electronics Ltd', code: 'APX', email: 'orders@apexelectronics.com', phone: '+91 91111 22222', address: { city: 'Bangalore', country: 'India' } },
      { name: 'Global Hardware & Co', code: 'GLB', email: 'sales@globalhardware.com', phone: '+91 92222 33333', address: { city: 'Mumbai', country: 'India' } },
      { name: 'Standard Food Distributors', code: 'SFD', email: 'logistics@standardfood.com', phone: '+91 93333 44444', address: { city: 'Chennai', country: 'India' } },
      { name: 'Fabrics & Threads Corp', code: 'FTC', email: 'info@fabricsthreads.com', phone: '+91 94444 55555', address: { city: 'Delhi', country: 'India' } },
    ]);

    // 2. Create default products
    await Product.deleteMany({});
    const productsData = [
      { sku: 'SKU-EL-101', name: 'Intel i7 Processor 13th Gen', category: 'Electronics', price: { cost: 22000, selling: 28000 }, stock: { current: 45, minimum: 10 }, supplier: suppliers[0]._id, createdBy: userId },
      { sku: 'SKU-EL-102', name: 'OLED Display Panel 27\"', category: 'Electronics', price: { cost: 18000, selling: 24000 }, stock: { current: 30, minimum: 5 }, supplier: suppliers[0]._id, createdBy: userId },
      { sku: 'SKU-EL-103', name: 'USB-C Thunderbolt Dock', category: 'Electronics', price: { cost: 4500, selling: 6000 }, stock: { current: 15, minimum: 15 }, supplier: suppliers[0]._id, createdBy: userId }, // Low Stock
      { sku: 'SKU-HW-201', name: 'Heavy Duty Steel Hinges (Pack of 10)', category: 'Hardware', price: { cost: 800, selling: 1200 }, stock: { current: 120, minimum: 20 }, supplier: suppliers[1]._id, createdBy: userId },
      { sku: 'SKU-HW-202', name: 'Titanium Screws M4 (Box of 500)', category: 'Hardware', price: { cost: 1500, selling: 2200 }, stock: { current: 80, minimum: 15 }, supplier: suppliers[1]._id, createdBy: userId },
      { sku: 'SKU-FD-301', name: 'Premium Jasmine Rice (25kg Bag)', category: 'Food', price: { cost: 1200, selling: 1800 }, stock: { current: 200, minimum: 30 }, supplier: suppliers[2]._id, createdBy: userId },
      { sku: 'SKU-FD-302', name: 'Cold Pressed Olive Oil (5L)', category: 'Food', price: { cost: 3500, selling: 4800 }, stock: { current: 12, minimum: 15 }, supplier: suppliers[2]._id, createdBy: userId }, // Low Stock
      { sku: 'SKU-CL-401', name: 'Cotton Crewneck T-Shirt (M)', category: 'Clothing', price: { cost: 400, selling: 750 }, stock: { current: 350, minimum: 50 }, supplier: suppliers[3]._id, createdBy: userId },
      { sku: 'SKU-CL-402', name: 'Denim Slimfit Jeans (32)', category: 'Clothing', price: { cost: 1100, selling: 1999 }, stock: { current: 140, minimum: 25 }, supplier: suppliers[3]._id, createdBy: userId },
      { sku: 'SKU-OT-501', name: 'Bamboo Stand Desk Organizer', category: 'Other', price: { cost: 950, selling: 1499 }, stock: { current: 3, minimum: 10 }, createdBy: userId }, // Low Stock
      { sku: 'SKU-EL-104', name: 'Logitech MX Master 3S Mouse', category: 'Electronics', price: { cost: 6500, selling: 8999 }, stock: { current: 65, minimum: 10 }, supplier: suppliers[0]._id, createdBy: userId },
      { sku: 'SKU-HW-203', name: 'Industrial Drill Machine 750W', category: 'Hardware', price: { cost: 2800, selling: 3999 }, stock: { current: 22, minimum: 8 }, supplier: suppliers[1]._id, createdBy: userId },
    ];
    const products = await Product.insertMany(productsData);

    // 3. Create default orders
    await Order.deleteMany({});
    const ordersData = [
      // Completed Sales Orders (will calculate Dynamic Revenue: 74,000 + 41,998 + 17,495 = 1,33,493)
      {
        orderNumber: `ORD-SL-${Math.floor(100000 + Math.random() * 900000)}`,
        orderType: 'Sales',
        items: [
          { product: products[0]._id, quantity: 2, price: products[0].price.selling, unitPrice: products[0].price.selling, total: products[0].price.selling * 2 }, 
          { product: products[2]._id, quantity: 3, price: products[2].price.selling, unitPrice: products[2].price.selling, total: products[2].price.selling * 3 }, 
        ],
        totalAmount: (products[0].price.selling * 2) + (products[2].price.selling * 3), 
        status: 'Completed',
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
        createdBy: userId
      },
      {
        orderNumber: `ORD-SL-${Math.floor(100000 + Math.random() * 900000)}`,
        orderType: 'Sales',
        items: [
          { product: products[1]._id, quantity: 1, price: products[1].price.selling, unitPrice: products[1].price.selling, total: products[1].price.selling }, 
          { product: products[10]._id, quantity: 2, price: products[10].price.selling, unitPrice: products[10].price.selling, total: products[10].price.selling * 2 }, 
        ],
        totalAmount: products[1].price.selling + (products[10].price.selling * 2), 
        status: 'Completed',
        orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), 
        createdBy: userId
      },
      {
        orderNumber: `ORD-SL-${Math.floor(100000 + Math.random() * 900000)}`,
        orderType: 'Sales',
        items: [
          { product: products[7]._id, quantity: 10, price: products[7].price.selling, unitPrice: products[7].price.selling, total: products[7].price.selling * 10 }, 
          { product: products[8]._id, quantity: 5, price: products[8].price.selling, unitPrice: products[8].price.selling, total: products[8].price.selling * 5 }, 
        ],
        totalAmount: (products[7].price.selling * 10) + (products[8].price.selling * 5), 
        status: 'Completed',
        orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), 
        createdBy: userId
      },
      // Purchase Orders
      {
        orderNumber: `ORD-PR-${Math.floor(100000 + Math.random() * 900000)}`,
        orderType: 'Purchase',
        supplier: suppliers[0]._id,
        items: [
          { product: products[0]._id, quantity: 10, price: products[0].price.cost, unitPrice: products[0].price.cost, total: products[0].price.cost * 10 },
        ],
        totalAmount: products[0].price.cost * 10, 
        status: 'Completed',
        orderDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), 
        createdBy: userId
      },
      {
        orderNumber: `ORD-PR-${Math.floor(100000 + Math.random() * 900000)}`,
        orderType: 'Purchase',
        supplier: suppliers[1]._id,
        items: [
          { product: products[3]._id, quantity: 50, price: products[3].price.cost, unitPrice: products[3].price.cost, total: products[3].price.cost * 50 },
        ],
        totalAmount: products[3].price.cost * 50, 
        status: 'Completed',
        orderDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), 
        createdBy: userId
      },
    ];
    await Order.insertMany(ordersData);
    console.log('✅ Database successfully populated with 12 premium products, 4 suppliers, and 5 matching orders.');
    return true;
  } catch (err) {
    console.error('❌ Seeding database failed:', err);
    return false;
  }
};

module.exports = { seedDatabase };
