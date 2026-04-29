import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product } from '../types';

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; size: string; color: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size: string; color: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; size: string; color: string; quantity: number } }
  | { type: 'UPDATE_SIZE'; payload: { productId: string; oldSize: string; newSize: string } }
  | { type: 'UPDATE_COLOR'; payload: { productId: string; oldColor: string; newColor: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartState {
  items: CartItem[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  updateSize: (productId: string, oldSize: string, newSize: string) => void;
  updateColor: (productId: string, oldColor: string, newColor: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size, color, quantity } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
        return { items: newItems };
      }
      return { items: [...state.items, { product, quantity, size, color }] };
    }
    case 'REMOVE_ITEM': {
      const { productId, size, color } = action.payload;
      return {
        items: state.items.filter(
          (item) => !(item.product.id === productId && item.size === size && item.color === color)
        ),
      };
    }
    case 'UPDATE_QUANTITY': {
      const { productId, size, color, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size && item.color === color)
          ),
        };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === productId && item.size === size && item.color === color
            ? { ...item, quantity }
            : item
        ),
      };
    }
    case 'UPDATE_SIZE': {
      const { productId, oldSize, newSize } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === productId && item.size === newSize
      );
      if (existingIndex >= 0) {
        const target = state.items.find(
          (item) => item.product.id === productId && item.size === oldSize
        );
        if (!target) return state;
        return {
          items: state.items
            .filter((item) => !(item.product.id === productId && item.size === oldSize))
            .map((item) =>
              item.product.id === productId && item.size === newSize
                ? { ...item, quantity: item.quantity + target.quantity }
                : item
            ),
        };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === productId && item.size === oldSize
            ? { ...item, size: newSize }
            : item
        ),
      };
    }
    case 'UPDATE_COLOR': {
      const { productId, oldColor, newColor } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === productId && item.color === newColor
      );
      if (existingIndex >= 0) {
        const target = state.items.find(
          (item) => item.product.id === productId && item.color === oldColor
        );
        if (!target) return state;
        return {
          items: state.items
            .filter((item) => !(item.product.id === productId && item.color === oldColor))
            .map((item) =>
              item.product.id === productId && item.color === newColor
                ? { ...item, quantity: item.quantity + target.quantity }
                : item
            ),
        };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === productId && item.color === oldColor
            ? { ...item, color: newColor }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    case 'LOAD_CART':
      return { items: action.payload };
    default:
      return state;
  }
}

function loadInitialState(): CartState {
  try {
    const saved = localStorage.getItem('cart');
    if (saved) {
      return { items: JSON.parse(saved) };
    }
  } catch {
    // ignore parse errors
  }
  return { items: [] };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product: Product, size: string, color: string, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, size, color, quantity } });
  };

  const removeItem = (productId: string, size: string, color: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, size, color } });
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, color, quantity } });
  };

  const updateSize = (productId: string, oldSize: string, newSize: string) => {
    dispatch({ type: 'UPDATE_SIZE', payload: { productId, oldSize, newSize } });
  };

  const updateColor = (productId: string, oldColor: string, newColor: string) => {
    dispatch({ type: 'UPDATE_COLOR', payload: { productId, oldColor, newColor } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const total = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, addItem, removeItem, updateQuantity, updateSize, updateColor, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
