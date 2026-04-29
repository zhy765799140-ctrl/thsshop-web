import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          T恤商店
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">
            首页
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="nav-link">
                我的订单
              </Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link">
                  管理后台
                </Link>
              )}
              <span className="nav-user">
                {user.name}
                <button className="logout-btn" onClick={logout}>退出</button>
              </span>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              登录
            </Link>
          )}
          <Link to="/cart" className="nav-link cart-link">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
