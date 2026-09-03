import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsManage from './pages/admin/ProductsManage';
import CategoriesManage from './pages/admin/CategoriesManage';
import OrdersManage from './pages/admin/OrdersManage';
import PaymentsManage from './pages/admin/PaymentsManage';
import RefundsManage from './pages/admin/RefundsManage';
import UsersManage from './pages/admin/UsersManage';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/my-orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsManage />} />
            <Route path="categories" element={<CategoriesManage />} />
            <Route path="orders" element={<OrdersManage />} />
            <Route path="payments" element={<PaymentsManage />} />
            <Route path="refunds" element={<RefundsManage />} />
            <Route path="users" element={<UsersManage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
