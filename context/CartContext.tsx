'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // Unique key: productId + variantId
  productId: number;
  name: string;
  price: number;
  image_path: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, variant?: any, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
  }, []);

  // Sync with localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, variant?: any, quantity: number = 1) => {
    setCart((prev) => {
      const cartItemId = variant ? `${product.id}-${variant.id}` : `${product.id}`;
      const existing = prev.find((item) => item.id === cartItemId);
      
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price: variant?.price_override ? parseFloat(variant.price_override) : parseFloat(product.price),
        image_path: product.image_path || '/no-image.jpg',
        quantity,
        size: variant?.size,
        color: variant?.color
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
