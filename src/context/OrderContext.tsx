import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Order, CartItem } from '../types';

type OrderAction =
  | { type: 'CREATE_ORDER'; payload: { orderId: string; items: CartItem[]; total: number; buyerPhone: string; buyerName: string; paymentProof: string } }
  | { type: 'UPDATE_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'UPDATE_ITEM_SIZE'; payload: { orderId: string; itemIndex: number; newSize: string } }
  | { type: 'UPDATE_ITEM'; payload: { orderId: string; itemIndex: number; color: string; size: string; quantity: number; newTotal: number } }
  | { type: 'DELETE_ORDER'; payload: { orderId: string } }
  | { type: 'LOAD_ORDERS'; payload: Order[] };

interface OrderState {
  orders: Order[];
}

interface OrderContextType {
  orders: Order[];
  createOrder: (items: CartItem[], total: number, buyerPhone: string, buyerName: string, paymentProof: string) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderItemSize: (orderId: string, itemIndex: number, newSize: string) => void;
  updateOrderItem: (orderId: string, itemIndex: number, color: string, size: string, quantity: number) => void;
  deleteOrder: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'CREATE_ORDER': {
      const { orderId, items, total, buyerPhone, buyerName, paymentProof } = action.payload;
      const newOrder: Order = {
        id: orderId,
        items,
        total,
        status: 'paid',
        buyerPhone,
        buyerName,
        createdAt: new Date().toISOString(),
        paymentProof,
      };
      return { orders: [newOrder, ...state.orders] };
    }
    case 'UPDATE_STATUS': {
      return {
        orders: state.orders.map((order) =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        ),
      };
    }
    case 'UPDATE_ITEM_SIZE': {
      const { orderId, itemIndex, newSize } = action.payload;
      return {
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;
          const newItems = order.items.map((item, i) => {
            if (i !== itemIndex) return item;
            return { ...item, size: newSize };
          });
          return { ...order, items: newItems };
        }),
      };
    }
    case 'UPDATE_ITEM': {
      const { orderId, itemIndex, color, size, quantity, newTotal } = action.payload;
      return {
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;
          const newItems = order.items.map((item, i) => {
            if (i !== itemIndex) return item;
            return { ...item, color, size, quantity };
          });
          return { ...order, items: newItems, total: newTotal };
        }),
      };
    }
    case 'DELETE_ORDER': {
      return {
        orders: state.orders.filter((order) => order.id !== action.payload.orderId),
      };
    }
    case 'LOAD_ORDERS':
      return { orders: action.payload };
    default:
      return state;
  }
}

function loadInitialOrderState(): OrderState {
  try {
    const saved = localStorage.getItem('orders');
    if (saved) {
      return { orders: JSON.parse(saved) };
    }
  } catch {
    // ignore parse errors
  }
  return { orders: [] };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, undefined, loadInitialOrderState);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(state.orders));
  }, [state.orders]);

  const createOrder = (items: CartItem[], total: number, buyerPhone: string, buyerName: string, paymentProof: string): string => {
    // 订单号使用自增序号格式：001, 002, ...
    const nextSeq = state.orders.length + 1;
    const orderId = String(nextSeq).padStart(3, '0');
    dispatch({ type: 'CREATE_ORDER', payload: { orderId, items, total, buyerPhone, buyerName, paymentProof } });
    return orderId;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { orderId, status } });
  };

  const updateOrderItemSize = (orderId: string, itemIndex: number, newSize: string) => {
    dispatch({ type: 'UPDATE_ITEM_SIZE', payload: { orderId, itemIndex, newSize } });
  };

  const updateOrderItem = (orderId: string, itemIndex: number, color: string, size: string, quantity: number) => {
    // 重新计算总金额
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;
    const newItems = order.items.map((item, i) => {
      if (i !== itemIndex) return item;
      return { ...item, color, size, quantity };
    });
    const newTotal = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    dispatch({ type: 'UPDATE_ITEM', payload: { orderId, itemIndex, color, size, quantity, newTotal } });
  };

  const deleteOrder = (orderId: string) => {
    dispatch({ type: 'DELETE_ORDER', payload: { orderId } });
  };

  return (
    <OrderContext.Provider value={{ orders: state.orders, createOrder, updateOrderStatus, updateOrderItemSize, updateOrderItem, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
