import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart_items';

export function CartProvider({ children }) {
  const { showToast } = useToast();
  const [items, setItems] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      const currentQty = existing ? existing.quantity : 0;
      const desiredQty = currentQty + quantity;

      if (desiredQty > product.stock) {
        showToast(`Only ${product.stock} in stock for "${product.name}"`, 'error');
        return prev;
      }

      if (existing) {
        return prev.map((i) => i.product._id === product._id ? { ...i, quantity: desiredQty } : i);
      }
      return [...prev, { product, quantity: desiredQty }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) => prev.map((i) => {
      if (i.product._id !== productId) return i;
      const clamped = Math.max(1, Math.min(quantity, i.product.stock));
      return { ...i, quantity: clamped };
    }));
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
const itemCount = items.length;
  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
