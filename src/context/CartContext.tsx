import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, Product, WishlistItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (product: Product, color: string, size: string, length?: string, qty?: number) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const addToCart = useCallback((product: Product, color: string, size: string, length?: string, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(
        i => i.product.id === product.id && i.color === color && i.size === size
      );
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.color === color && i.size === size
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
            : i
        );
      }
      return [...prev, { product, quantity: qty, color, size, length }];
    });
    showToast(`"${product.name}" added to cart`);
  }, [showToast]);

  const removeFromCart = useCallback((productId: string, color: string, size: string) => {
    setCart(prev => prev.filter(
      i => !(i.product.id === productId && i.color === color && i.size === size)
    ));
  }, []);

  const updateQuantity = useCallback((productId: string, color: string, size: string, qty: number) => {
    setCart(prev => prev.map(i =>
      i.product.id === productId && i.color === color && i.size === size
        ? { ...i, quantity: Math.max(1, qty) }
        : i
    ));
    showToast('Quantity updated');
  }, [showToast]);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) {
        showToast('Removed from wishlist');
        return prev.filter(i => i.product.id !== product.id);
      }
      showToast('Added to wishlist');
      return [...prev, { product }];
    });
  }, [showToast]);

  const isWishlisted = useCallback((productId: string) =>
    wishlist.some(i => i.product.id === productId), [wishlist]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, wishlist, addToCart, removeFromCart, updateQuantity, clearCart,
      toggleWishlist, isWishlisted, cartCount, cartTotal,
      isCartOpen, setIsCartOpen, isSearchOpen, setIsSearchOpen,
      toast, showToast,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
