import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { CartItem, Product, ApiCartItem } from '../types';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateItemPrice: (productId: string, newPrice: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'ordersystem_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function apiItemToCartItem(api: ApiCartItem): CartItem {
  return {
    product: {
      id: api.productId,
      name: api.productName,
      price: api.price,
      stock: api.stock,
    },
    quantity: api.quantity,
    currentPrice: api.currentPrice,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [items, setItems] = useState<CartItem[]>(() => (user ? [] : loadCart()));

  // Track previous user ID to detect login/logout
  const prevId = useRef(user?.id ?? null);
  const initDone = useRef(false);

  useEffect(() => {
    const uid = user?.id ?? null;
    const prev = prevId.current;
    prevId.current = uid;

    if (uid === prev && initDone.current) return;

    if (!uid) {
      setItems(loadCart());
      initDone.current = true;
      return;
    }

    // Logged in — load or merge
    if (!prev && loadCart().length > 0) {
      const local = loadCart();
      cartService
        .merge(local.map((i) => ({ productId: i.product.id, quantity: i.quantity })))
        .then((apiCart) => {
          setItems(apiCart.items.map(apiItemToCartItem));
          localStorage.removeItem(STORAGE_KEY);
        })
        .catch(() => cartService.getCart().then((c) => setItems(c.items.map(apiItemToCartItem))))
        .finally(() => { initDone.current = true; });
    } else {
      cartService
        .getCart()
        .then((c) => setItems(c.items.map(apiItemToCartItem)))
        .catch(() => setItems([]))
        .finally(() => { initDone.current = true; });
    }
  }, [user?.id]);

  // Persist to localStorage when offline
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoggedIn]);

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      if (isLoggedIn) {
        try {
          const apiCart = await cartService.addItem(product.id, quantity);
          setItems(apiCart.items.map(apiItemToCartItem));
        } catch { /* keep existing state */ }
      } else {
        setItems((prev) => {
          const existing = prev.find((i) => i.product.id === product.id);
          if (existing) {
            return prev.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            );
          }
          return [...prev, { product, quantity }];
        });
      }
    },
    [isLoggedIn]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (isLoggedIn) {
        try {
          const apiCart = await cartService.removeItem(productId);
          setItems(apiCart.items.map(apiItemToCartItem));
        } catch { /* keep existing state */ }
      } else {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
      }
    },
    [isLoggedIn]
  );

  const updateQty = useCallback(
    async (productId: string, qty: number) => {
      if (qty <= 0) {
        removeItem(productId);
        return;
      }

      if (isLoggedIn) {
        try {
          const apiCart = await cartService.updateQty(productId, qty);
          setItems(apiCart.items.map(apiItemToCartItem));
        } catch { /* keep existing state */ }
      } else {
        setItems((prev) =>
          prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
        );
      }
    },
    [isLoggedIn, removeItem]
  );

  const updateItemPrice = useCallback(
    async (productId: string, newPrice: number) => {
      if (isLoggedIn) {
        try {
          const apiCart = await cartService.updateItemPrice(productId, newPrice);
          setItems(apiCart.items.map(apiItemToCartItem));
        } catch { /* keep existing state */ }
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.product.id === productId
              ? { ...i, product: { ...i.product, price: newPrice }, currentPrice: newPrice }
              : i
          )
        );
      }
    },
    [isLoggedIn]
  );

  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      try {
        await cartService.clearCart();
      } catch { /* ignore */ }
    }
    setItems([]);
  }, [isLoggedIn]);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const apiCart = await cartService.getCart();
      setItems(apiCart.items.map(apiItemToCartItem));
    } catch { /* keep existing state */ }
  }, [isLoggedIn]);

  const total = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider       value={{ items, addItem, removeItem, updateQty, updateItemPrice, clearCart, refreshCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
