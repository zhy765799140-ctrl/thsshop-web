import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import CheckoutConfirmModal from '../components/CheckoutConfirmModal';
import { ALL_SIZES } from '../data/products';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, updateSize, updateColor, total, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      alert('请先登录');
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      alert('购物车为空');
      return;
    }
    setShowCheckoutConfirm(true);
  };

  // 确认下单 → 直接打开支付弹窗
  const handleConfirmCheckout = () => {
    setShowCheckoutConfirm(false);
    if (!user) return;
    setShowPayment(true);
  };

  // 支付完成 → 创建订单（此时才真正生成订单）
  const handlePaymentConfirm = (paymentProof: string) => {
    if (!user) return;
    createOrder(items, finalTotal, user.phone, user.name, paymentProof);
    clearCart();
    setShowPayment(false);
    navigate('/orders');
  };

  // 支付取消 → 回到购物车，不创建任何订单
  const handlePaymentClose = () => {
    setShowPayment(false);
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>购物车为空</h2>
        <p>快去挑选你喜欢的T恤吧</p>
        <button onClick={() => navigate('/')}>去逛逛</button>
      </div>
    );
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasDiscount = totalQuantity >= 2;
  const finalTotal = hasDiscount ? Math.ceil(total * 0.9) : total;

  return (
    <div className="cart">
      <h1 className="cart-title">购物车</h1>
      <div className="discount-banner">
        {hasDiscount ? (
          <span className="discount-banner-active">🎉 已享 9 折优惠！</span>
        ) : (
          <span className="discount-banner-hint">💡 买 2 件及以上享 9 折优惠</span>
        )}
      </div>
      <div className="cart-content">
        <div className="cart-items">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.size}-${item.color}`} className="cart-item">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.product.name}</h3>
                {item.color && (
                  <div className="cart-item-color">
                    <span>颜色：</span>
                    <select
                      value={item.color}
                      onChange={(e) => updateColor(item.product.id, item.color, e.target.value)}
                      className="color-select"
                    >
                      {item.product.colors?.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="cart-item-size">
                  <span>尺码：</span>
                  <select
                    value={item.size}
                    onChange={(e) => updateSize(item.product.id, item.size, e.target.value)}
                    className="size-select"
                  >
                    {ALL_SIZES.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <p className="cart-item-price">¥{item.product.price}</p>
              </div>
              <div className="cart-item-quantity">
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
              <p className="cart-item-subtotal">
                ¥{(item.product.price * item.quantity).toFixed(2)}
              </p>
              <button
                className="cart-item-remove"
                onClick={() => removeItem(item.product.id, item.size, item.color)}
              >
                删除
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>订单摘要</h2>
          <div className="summary-row">
            <span>商品总数</span>
            <span>{totalQuantity} 件</span>
          </div>
          {hasDiscount && (
            <div className="summary-row original-price">
              <span>原价</span>
              <span>¥{total.toFixed(2)}</span>
            </div>
          )}
          {hasDiscount && (
            <div className="summary-row discount">
              <span>9 折优惠</span>
              <span>-¥{(total - finalTotal).toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>总计</span>
            <span>¥{finalTotal.toFixed(2)}</span>
          </div>
          {!hasDiscount && (
            <p className="discount-tip">再加购 {2 - totalQuantity} 件可享 9 折优惠</p>
          )}
          <button className="checkout-btn" onClick={handleCheckout}>
            去结算
          </button>
        </div>
      </div>
      {showPayment && (
        <PaymentModal
          amount={finalTotal}
          onConfirm={handlePaymentConfirm}
          onClose={handlePaymentClose}
        />
      )}
      {showCheckoutConfirm && (
        <CheckoutConfirmModal
          onConfirm={handleConfirmCheckout}
          onClose={() => setShowCheckoutConfirm(false)}
        />
      )}
    </div>
  );
}
