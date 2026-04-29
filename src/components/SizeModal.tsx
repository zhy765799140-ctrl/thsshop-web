import { useState } from 'react';
import type { Product } from '../types';
import './SizeModal.css';

interface SizeModalProps {
  product: Product;
  onConfirm: (size: string, color: string, quantity: number) => void;
  onClose: () => void;
}

export default function SizeModal({ product, onConfirm, onClose }: SizeModalProps) {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    if (!selectedColor) {
      alert('请选择颜色');
      return;
    }
    if (!selectedSize) {
      alert('请选择尺码');
      return;
    }
    onConfirm(selectedSize, selectedColor, quantity);
  };

  return (
    <div className="size-modal-overlay" onClick={onClose}>
      <div className="size-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="size-modal-title">选择规格</h3>
        <p className="size-modal-product">{product.name}</p>
        {product.colors && product.colors.length > 0 && (
          <>
            <p className="option-label">颜色</p>
            <div className="size-options">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`size-option color-option ${selectedColor === color ? 'active' : ''}`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </>
        )}
        <p className="option-label">尺码</p>
        <div className="size-options">
          {product.sizes.map((size) => (
            <button
              key={size}
              className={`size-option ${selectedSize === size ? 'active' : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
        <p className="option-label">数量</p>
        <div className="quantity-selector">
          <button
            className="qty-btn"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="qty-value">{quantity}</span>
          <button
            className="qty-btn"
            onClick={() => setQuantity((q) => q + 1)}
          >
            ＋
          </button>
        </div>
        <div className="size-modal-actions">
          <button className="size-cancel-btn" onClick={onClose}>取消</button>
          <button className="size-confirm-btn" onClick={handleConfirm}>
            加入购物车
          </button>
        </div>
      </div>
    </div>
  );
}
