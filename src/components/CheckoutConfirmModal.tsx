import { useState } from 'react';
import './CheckoutConfirmModal.css';

interface CheckoutConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export default function CheckoutConfirmModal({ onConfirm, onClose }: CheckoutConfirmModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>确认下单</h2>
        <div className="modal-body">
          <p className="warning-text">下单后商品尺码将无法自行修改</p>
          <p className="info-text">如需修改尺码，请联系管理员后台处理</p>
          <div className="remark-confirm-section">
            <div className="remark-confirm-notice">
              ⚠️ 支付时请在支付宝备注栏填写您的<strong>手机号和姓名</strong>，方便核对订单
            </div>
            <label className="remark-checkbox">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>我已知悉，支付时会在支付宝备注栏填写手机号和姓名</span>
            </label>
          </div>
        </div>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>返回修改</button>
          <button
            className={`modal-confirm ${confirmed ? '' : 'modal-confirm-disabled'}`}
            onClick={confirmed ? onConfirm : undefined}
            disabled={!confirmed}
          >
            确认下单
          </button>
        </div>
      </div>
    </div>
  );
}
