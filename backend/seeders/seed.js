require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');
const { User, Category, Product, Order, OrderItem, Payment, PaymentStatusHistory, Refund } = require('../models');

const categoriesData = [
  { name: 'Electronics', description: 'Phones, laptops, gadgets and accessories' },
  { name: 'Clothing', description: 'Men, women and kids apparel' },
  { name: 'Home & Kitchen', description: 'Furniture, appliances and kitchenware' },
  { name: 'Books', description: 'Fiction, non-fiction and educational books' },
  { name: 'Sports & Outdoors', description: 'Fitness gear and outdoor equipment' }
];

const productSeeds = (categoryMap) => [
  { name: 'Wireless Bluetooth Headphones', description: 'Over-ear noise-cancelling headphones with 30h battery life.', price: 89.99, stock: 45, category: categoryMap['Electronics'], image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
  { name: 'Smartphone 128GB', description: 'Latest generation smartphone with triple camera setup.', price: 599.0, stock: 20, category: categoryMap['Electronics'], image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
  { name: '14-inch Laptop', description: 'Lightweight laptop, 16GB RAM, 512GB SSD, ideal for work and study.', price: 899.5, stock: 12, category: categoryMap['Electronics'], image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
  { name: 'Smart Watch', description: 'Fitness tracking smartwatch with heart-rate monitor.', price: 129.99, stock: 30, category: categoryMap['Electronics'], image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
  { name: 'Portable Bluetooth Speaker', description: 'Waterproof speaker with 12-hour playtime.', price: 39.99, stock: 60, category: categoryMap['Electronics'], image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600' },
  { name: "Men's Casual Shirt", description: '100% cotton slim-fit shirt.', price: 24.99, stock: 80, category: categoryMap['Clothing'], image_url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600' },
  { name: "Women's Summer Dress", description: 'Lightweight floral summer dress.', price: 34.5, stock: 55, category: categoryMap['Clothing'], image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600' },
  { name: 'Running Shoes', description: 'Breathable mesh running shoes with cushioned sole.', price: 59.99, stock: 40, category: categoryMap['Clothing'], image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
  { name: 'Denim Jacket', description: 'Classic unisex denim jacket.', price: 49.99, stock: 25, category: categoryMap['Clothing'], image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
  { name: 'Non-stick Cookware Set', description: '10-piece non-stick pots and pans set.', price: 79.99, stock: 18, category: categoryMap['Home & Kitchen'], image_url: 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=600' },
  { name: 'Electric Kettle', description: '1.7L stainless steel electric kettle.', price: 22.99, stock: 50, category: categoryMap['Home & Kitchen'], image_url: 'https://images.unsplash.com/photo-1594213456254-e5db7dfd25e5?w=600' },
  { name: 'Memory Foam Pillow', description: 'Ergonomic cervical support pillow.', price: 18.5, stock: 70, category: categoryMap['Home & Kitchen'], image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600' },
  { name: 'The Pragmatic Programmer', description: 'A classic guide for software developers.', price: 29.99, stock: 35, category: categoryMap['Books'], image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600' },
  { name: 'Atomic Habits', description: 'A practical guide to building good habits.', price: 16.99, stock: 90, category: categoryMap['Books'], image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600' },
  { name: 'Yoga Mat', description: 'Non-slip eco-friendly yoga mat.', price: 19.99, stock: 65, category: categoryMap['Sports & Outdoors'], image_url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600' },
  { name: 'Adjustable Dumbbell Set', description: '2x adjustable dumbbells, 5-25kg each.', price: 149.99, stock: 3, category: categoryMap['Sports & Outdoors'], image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600' },
  { name: 'Camping Tent (4-person)', description: 'Waterproof 4-person camping tent.', price: 109.99, stock: 0, category: categoryMap['Sports & Outdoors'], image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600' }
];

async function seed() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    Refund.deleteMany({}), PaymentStatusHistory.deleteMany({}), Payment.deleteMany({}),
    OrderItem.deleteMany({}), Order.deleteMany({}), Product.deleteMany({}),
    Category.deleteMany({}), User.deleteMany({})
  ]);

  console.log('Seeding users...');
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const customerPassword = await bcrypt.hash('Customer@123', 12);

  const admin = await User.create({ name: 'Admin User', email: 'admin@example.com', password: adminPassword, role: 'admin' });
  const customer = await User.create({ name: 'Jane Customer', email: 'customer@example.com', password: customerPassword, role: 'customer' });

  console.log('Seeding categories...');
  const categories = await Category.insertMany(categoriesData);
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.name] = c._id; });

  console.log('Seeding products...');
  const products = await Product.insertMany(productSeeds(categoryMap));

  console.log('Seeding a sample order with payment + history...');
  const sampleItems = [products[0], products[5]];
  const total = sampleItems.reduce((sum, p) => sum + p.price, 0);

  const order = await Order.create({
    user: customer._id, order_date: new Date(), total_amount: Math.round(total * 100) / 100,
    status: 'confirmed', shipping_address: '123 Main Street, Lahore, Pakistan'
  });

  await OrderItem.insertMany(sampleItems.map(p => ({ order: order._id, product: p._id, quantity: 1, price: p.price })));

  const payment = await Payment.create({
    order: order._id, amount: order.total_amount, payment_method: 'card',
    payment_status: 'paid', transaction_id: 'CARD-seed0001', paid_at: new Date()
  });

  await PaymentStatusHistory.insertMany([
    { payment: payment._id, status: 'pending', note: 'Payment record created at checkout', changed_at: new Date(Date.now() - 60000), changed_by: customer.email },
    { payment: payment._id, status: 'paid', note: 'Payment completed via card (demo gateway)', changed_at: new Date(), changed_by: customer.email }
  ]);

  console.log('\nSeed complete!');
  console.log('----------------------------------------');
  console.log('Admin login:    admin@example.com / Admin@123');
  console.log('Customer login: customer@example.com / Customer@123');
  console.log('----------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
}

async function destroy() {
  await connectDB();
  await Promise.all([
    Refund.deleteMany({}), PaymentStatusHistory.deleteMany({}), Payment.deleteMany({}),
    OrderItem.deleteMany({}), Order.deleteMany({}), Product.deleteMany({}),
    Category.deleteMany({}), User.deleteMany({})
  ]);
  console.log('All collections cleared.');
  await mongoose.connection.close();
  process.exit(0);
}

if (process.argv.includes('--destroy')) {
  destroy().catch(err => { console.error(err); process.exit(1); });
} else {
  seed().catch(err => { console.error(err); process.exit(1); });
}
