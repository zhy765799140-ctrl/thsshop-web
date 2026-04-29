import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !name) {
      setError('请输入手机号和真实姓名');
      return;
    }
    if (phone !== 'admin' && !/^1\d{10}$/.test(phone)) {
      setError('请输入正确的11位手机号');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(phone, name);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || '登录失败');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>登录</h1>
        <div className="form-group">
          <label>手机号</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="输入手机号"
            maxLength={11}
          />
        </div>
        <div className="form-group">
          <label>真实姓名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入真实姓名"
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
        <p className="login-tip">
          首次输入手机号和姓名会自动创建账号<br />
          再次登录需输入相同信息
        </p>
      </form>
    </div>
  );
}
