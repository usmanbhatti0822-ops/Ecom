# Meridian — Full-Stack E-Commerce Project

A complete e-commerce application: **Node.js + Express + MongoDB (Mongoose)** backend,
**React + Vite** frontend (plain CSS, no Tailwind).

## Features
- JWT authentication (register/login), bcrypt password hashing
- Product & category management with search, filters, sorting, pagination
- Cart, checkout, order creation with server-side stock/price validation
- Order → Payment enforced as a strict 1:1 relationship (unique index on `Payment.order`)
- Payment status history (append-only) and refunds (partial/multiple supported)
- Admin panel: dashboard stats, products, categories, orders, payments, refunds, users
- Centralized error handling, consistent `{ success, message, data }` API responses

## Tech Stack
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, express-validator
- Frontend: React 18, Vite, React Router, Axios, plain CSS (custom design system)

## Data Model / Relationships
```
User 1───M Order
Category 1───M Product
Order 1───M OrderItem
Product 1───M OrderItem
Order 1───1 Payment      (Payment.order has a UNIQUE index)
Payment 1───M PaymentStatusHistory
Payment 1───M Refund
```

**Note on deviations from a minimal ERD:** `User.role` (customer/admin) was added for admin
functionality; `Product.image_url` and `Order.shipping_address` were added because the frontend
and checkout flow need them. These are additive fields only — all core entities/relationships
above are implemented exactly as specified.

## Project Structure
```
ecommerce-project/
├── backend/
│   ├── config/database.js        # Mongoose connection
│   ├── controllers/               # auth, user, category, product, order, payment,
│   │                               # paymentStatus, refund, dashboard
│   ├── middleware/                # auth (JWT), error handling, validation
│   ├── models/                    # User, Category, Product, Order, OrderItem,
│   │                               # Payment, PaymentStatusHistory, Refund
│   ├── routes/
│   ├── seeders/seed.js            # demo data
│   ├── app.js / server.js
│   └── package.json / .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js          # Axios instance + auth interceptor
    │   ├── context/               # Auth, Cart, Toast
    │   ├── components/            # Navbar, ProductCard, StatusBadge, etc.
    │   ├── pages/                 # Home, Products, Cart, Checkout, MyOrders, ...
    │   └── pages/admin/           # Dashboard, ProductsManage, OrdersManage, ...
    └── package.json / vite.config.js / .env.example
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

**Transactions note:** Order creation and payment processing use MongoDB session
transactions when available. Transactions require MongoDB to run as a **replica set**.
- MongoDB Atlas: always a replica set — works out of the box.
- Local MongoDB: either run `mongod --replSet rs0` and initialize it once with
  `mongosh --eval "rs.initiate()"`, **or** just run a plain standalone `mongod` —
  the backend automatically falls back to a safe, non-transactional order/payment
  path in that case, so the app still works for local development.

### 1. Backend
```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI and a real JWT_SECRET
npm install
npm run seed        # creates demo users, categories, products, one sample order
npm run dev          # starts on http://localhost:5000
```

Demo accounts created by the seeder:
- Admin:    `admin@example.com` / `Admin@123`
- Customer: `customer@example.com` / `Customer@123`

### 2. Frontend
```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev             # starts on http://localhost:5173
```

Open http://localhost:5173.

## API Overview
All responses follow `{ success, message, data?, meta? }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `GET/PUT /api/users/profile`, `GET /api/users` (admin), `PUT /api/users/:id/role` (admin) |
| Categories | `GET/POST/PUT/DELETE /api/categories` |
| Products | `GET/POST/PUT/DELETE /api/products` (supports `search`, `category`, `minPrice`, `maxPrice`, `sort`, `order`, `page`, `limit`) |
| Orders | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/status` (admin) |
| Payments | `GET /api/payments/order/:orderId`, `POST /api/payments/order/:orderId/process`, `GET/POST /api/payments/:paymentId/history` |
| Refunds | `GET/POST /api/refunds`, `PUT /api/refunds/:id` (admin) |
| Admin | `GET /api/admin/dashboard` |

## Payment Gateways
Real Stripe/JazzCash/Easypaisa credentials are **not** included (none were provided, and none
should ever be committed). Card/Stripe/JazzCash/Easypaisa payments are processed through a
clearly-labeled demo/mock gateway (`simulateGatewayCharge` in `paymentController.js`) that
returns a realistic success/failure result so the full payment lifecycle can be exercised.
COD is handled for real (no gateway call needed). Swap in real SDK calls there when you have
credentials.

## Testing Checklist
Manually verified via code review and static analysis (see note below):
- Register / login / duplicate email / invalid login
- Protected routes reject requests without a valid JWT
- Category & product CRUD, filtering, search, pagination
- Order creation: stock re-checked server-side, prices taken from DB not frontend,
  total computed server-side, stock decremented atomically
- Payment created exactly once per order (unique index prevents duplicates)
- Payment status changes always logged to history, never silently overwritten
- Refund amount validated against remaining refundable balance
- Admin-only routes reject non-admin users

**Important:** this project was built in a sandboxed environment with no internet access,
so `npm install` / a live MongoDB / a live run of the app were not possible during
development. Every backend file passed a Node.js syntax check and every frontend file passed
a TypeScript-parser syntax check (0 errors across 76 files), but you should run
`npm install && npm run dev` yourself on both sides and smoke-test the flows above before
relying on this in production.

## Future Improvements
- Real payment gateway integrations (Stripe SDK, JazzCash/Easypaisa APIs)
- Product image uploads (currently URL-based)
- Email notifications on order/payment status changes
- Automated test suite (Jest/Supertest for backend, React Testing Library for frontend)
- Product reviews/ratings
