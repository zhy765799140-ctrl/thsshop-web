import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import SizeModal from './SizeModal';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [showSizeModal, setShowSizeModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSizeModal(true);
  };

  const handleSizeConfirm = (size: string, color: string, quantity: number) => {
    addItem(product, size, color, quantity);
    setShowSizeModal(false);
  };

  return (
    <>
      <Link to={`/product/${product.id}`} className="product-card">
        <div className="product-image-wrapper">
          <img src={product.image} alt={product.name} className="product-image" />
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">¥{product.price}</p>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            加入购物车
          </button>
        </div>
      </Link>
      {showSizeModal && (
        <SizeModal
          product={product}
          onConfirm={handleSizeConfirm}
          onClose={() => setShowSizeModal(false)}
        />
      )}
    </>
  );
}
