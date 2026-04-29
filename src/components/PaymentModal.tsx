import { useState, useRef } from 'react';
import { useBanner } from '../context/BannerContext';
import './PaymentModal.css';

interface PaymentModalProps {
  amount: number;
  onConfirm: (paymentProof: string) => void;
  onClose: () => void;
}

export default function PaymentModal({ amount, onConfirm, onClose }: PaymentModalProps) {
  const { payQrCode } = useBanner();
  const [paymentProof, setPaymentProof] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPaymentProof(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!paymentProof) {
      alert('请上传支付截图');
      return;
    }
    setIsPaid(true);
    setTimeout(() => {
      onConfirm(paymentProof);
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        {!isPaid ? (
          <>
            <h2 className="modal-title">支付宝扫码支付</h2>
            <div className="qr-code-wrapper">
              {payQrCode ? (
                <img src={payQrCode} alt="支付宝二维码" className="qr-code" />
              ) : (
                <div className="qr-placeholder">管理员未配置收款码</div>
              )}
            </div>
            <p className="payment-amount">支付金额：¥{amount.toFixed(2)}</p>
            <p className="payment-tip">请使用支付宝扫描上方二维码完成支付</p>
            <div className="remark-section">
              <div className="remark-notice">
                <span className="remark-notice-icon">⚠️</span>
                <span>支付时请在支付宝备注栏填写您的<strong>手机号和姓名</strong>，方便核对订单</span>
              </div>
            </div>
            <div className="proof-upload-section">
              <p className="proof-label">上传支付截图：</p>
              <div className="proof-upload-area" onClick={() => fileInputRef.current?.click()}>
                {paymentProof ? (
                  <div className="proof-preview-wrapper">
                    <img src={paymentProof} alt="支付截图" className="proof-preview" />
                    <button
                      type="button"
                      className="proof-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentProof('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="proof-placeholder">
                    <span>+</span>
                    <span>点击上传截图</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </div>
            <button className="confirm-btn" onClick={handleConfirm}>
              我已完成支付
            </button>
            <button className="cancel-btn" onClick={onClose}>
              取消
            </button>
          </>
        ) : (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>支付成功</h2>
            <p>正在跳转到订单页面...</p>
          </div>
        )}
      </div>
    </div>
  );
}
