import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="not-found">
        <h2>商品不存在</h2>
        <button onClick={() => navigate('/')}>返回首页</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('请选择颜色');
      return;
    }
    if (!selectedSize) {
      alert('请选择尺码');
      return;
    }
    addItem(product, selectedSize, selectedColor, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← 返回
      </button>
      <div className="detail-layout">
        <div className="detail-left">
          <div className="detail-image-wrapper">
            <img src={product.image} alt={product.name} className="detail-image" />
          </div>
          {product.detailImage && (
            <div className="detail-long-image">
              <img src={product.detailImage} alt={`${product.name} 详情`} />
            </div>
          )}
        </div>
        <div className="detail-right">
          <div className="detail-info">
            <h1 className="detail-name">{product.name}</h1>
            <p className="detail-price">¥{product.price}</p>
            <p className="detail-description">{product.description}</p>
            {product.colors && product.colors.length > 0 && (
              <div className="size-selector">
                <label>选择颜色：</label>
                <div className="size-options">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`size-btn color-btn ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="size-selector">
              <label>选择尺码：</label>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="size-selector">
              <label>购买数量：</label>
              <div className="quantity-selector">
                <button
                  className="pd-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="pd-qty-value">{quantity}</span>
                <button
                  className="pd-qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  ＋
                </button>
              </div>
            </div>
            <button
              className={`add-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {added ? '已加入购物车' : '加入购物车'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
