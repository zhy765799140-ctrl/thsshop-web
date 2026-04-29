import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

export default function Orders() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState('');

  if (!user) {
    return (
      <div className="orders-empty">
        <h2>请先登录</h2>
        <p>登录后可查看订单</p>
        <button onClick={() => navigate('/login')}>去登录</button>
      </div>
    );
  }

  const myOrders = orders.filter((o) => {
    if (o.buyerPhone !== user.phone) return false;
    if (dateFilter) {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
      return orderDate === dateFilter;
    }
    return true;
  });

  const statusText = {
    paid: '未提货',
    shipped: '已提货',
  };

  const statusClass = {
    paid: 'status-paid',
    shipped: 'status-shipped',
  };

  if (orders.filter((o) => o.buyerPhone === user.phone).length === 0) {
    return (
      <div className="orders-empty">
        <h2>暂无订单</h2>
        <p>快去挑选你喜欢的T恤吧</p>
        <button onClick={() => navigate('/')}>去逛逛</button>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="orders-header">
        <h1 className="orders-title">我的订单</h1>
        <div className="date-filter">
          <label>按日期筛选：</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button className="clear-filter" onClick={() => setDateFilter('')}>
              清除
            </button>
          )}
        </div>
      </div>
      {myOrders.length === 0 ? (
        <div className="orders-empty">
          <p>{dateFilter ? '该日期下没有订单' : '暂无订单'}</p>
        </div>
      ) : (
        <div className="orders-list">
          {myOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">订单号：{order.id}</span>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span className="order-time">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
                <span className={`order-status ${statusClass[order.status]}`}>
                  {statusText[order.status]}
                </span>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="order-item-image"
                    />
                    <div className="order-item-info">
                      <p className="order-item-name">{item.product.name}</p>
                      <p className="order-item-detail">
                        {item.color && `颜色：${item.color} · `}尺码：{item.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="order-item-price">
                      ¥{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              {order.paymentProof && (
                <div className="order-proof">
                  <span className="proof-label">支付凭证：</span>
                  <img src={order.paymentProof} alt="支付截图" className="proof-thumb" />
                </div>
              )}
              <div className="order-footer">
                <span className="order-total">
                  合计：¥{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
