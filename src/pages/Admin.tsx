import { useState, useRef } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useBanner } from '../context/BannerContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { ALL_SIZES, ALL_COLORS } from '../data/products';
import type { Product, Order } from '../types';
import './Admin.css';

function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { banner, updateBanner, payQrCode, updatePayQrCode } = useBanner();
  const { orders, updateOrderStatus, updateOrderItem, updateOrderItemSize, deleteOrder } = useOrders();
  const [activeTab, setActiveTab] = useState<'products' | 'banner' | 'orders' | 'production' | 'payment'>('orders');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    detailImage: '',
    description: '',
    colors: [] as string[],
  });
  const [bannerImage, setBannerImage] = useState(banner.image);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const qrCodeFileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) {
    return (
      <div className="admin-no-access">
        <h2>无权限访问</h2>
        <p>请使用管理员账号登录（手机号和姓名都填 admin）</p>
        <button onClick={() => navigate('/login')}>去登录</button>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({ name: '', price: '', image: '', detailImage: '', description: '', colors: [] });
    setEditingId(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (detailFileInputRef.current) detailFileInputRef.current.value = '';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setFormData({ ...formData, image: base64 });
    } catch {
      alert('图片处理失败，请重试');
    }
  };

  const handleDetailImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 800, 0.85);
      setFormData({ ...formData, detailImage: base64 });
    } catch {
      alert('图片处理失败，请重试');
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 1200, 0.85);
      setBannerImage(base64);
      updateBanner({ image: base64 });
    } catch {
      alert('图片处理失败，请重试');
    }
  };

  const handleQrCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 600, 0.9);
      updatePayQrCode(base64);
    } catch {
      alert('图片处理失败，请重试');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      detailImage: product.detailImage || '',
      description: product.description,
      colors: product.colors || [],
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      price: Number(formData.price),
      image: formData.image,
      detailImage: formData.detailImage,
      description: formData.description,
      sizes: ALL_SIZES,
      colors: formData.colors,
    };

    if (editingId) {
      updateProduct(editingId, productData);
    } else {
      addProduct(productData);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除这款T恤吗？')) {
      deleteProduct(id);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('确定删除此订单吗？删除后不可恢复。')) {
      deleteOrder(orderId);
    }
  };

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  // 订单商品编辑状态
  const [editingItem, setEditingItem] = useState<{ orderId: string; itemIndex: number } | null>(null);
  const [editForm, setEditForm] = useState({ color: '', size: '', quantity: 1 });

  const startEditingItem = (orderId: string, itemIndex: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const item = order.items[itemIndex];
    setEditingItem({ orderId, itemIndex });
    setEditForm({ color: item.color || ALL_COLORS[0], size: item.size, quantity: item.quantity });
  };

  const confirmEditItem = () => {
    if (!editingItem) return;
    updateOrderItem(editingItem.orderId, editingItem.itemIndex, editForm.color, editForm.size, editForm.quantity);
    setEditingItem(null);
  };

  const cancelEditItem = () => {
    setEditingItem(null);
  };

  const exportToExcel = () => {
    const headers = ['买家姓名', '买家手机', '订单号', '下单时间', '商品详情', '总金额', '支付凭证', '状态'];
    const statusText: Record<string, string> = {
      paid: '未提货',
      shipped: '已提货',
    };

    // 构建 HTML 表格，图片用 base64 内嵌
    let tableHTML = `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:'Microsoft YaHei',sans-serif;">`;
    
    // 表头
    tableHTML += '<thead><tr>';
    headers.forEach((h) => {
      tableHTML += `<th style="background:#f5f5f5;font-weight:500;text-align:center;padding:8px 12px;border:1px solid #ddd;">${h}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // 数据行
    orders.forEach((order) => {
      const items = order.items
        .map((item) => `${item.product.name}(${item.size})×${item.quantity}`)
        .join('；');

      tableHTML += '<tr>';
      
      // 买家姓名
      tableHTML += `<td style="padding:8px 12px;border:1px solid #ddd;text-align:center;">${order.buyerName}</td>`;
      // 买家手机
      tableHTML += `<td style="padding:8px 12px;border:1px solid #ddd;text-align:center;color:#666;">${order.buyerPhone}</td>`;
      // 订单号
      tableHTML += `<td style="padding:8px 12px;border:1px solid #ddd;text-align:center;font-family:monospace;">${order.id}</td>`;
      // 下单时间
      tableHTML += `<td style="padding:8px 12px;border:1px solid #ddd;white-space:nowrap;">${new Date(order.createdAt).toLocaleString()}</td>`;
      // 商品详情
      tableHTML += `<td style="padding:8px 12px;border:1px solid #ddd;font-size:13px;">${items}</td>`;
      // 金额
      tableHTML += `<td style="padding:8px 12px;border:1px solid #ddd;text-align:right;color:#ff4444;font-weight:bold;">¥${order.total.toFixed(2)}</td>`;
      // 支付凭证（带图片）
      if (order.paymentProof) {
        tableHTML += `<td style="padding:4px;border:1px solid #ddd;text-align:center;"><img src="${order.paymentProof}" alt="支付凭证" style="max-width:120px;max-height:80px;object-fit:contain;display:inline-block;" /></td>`;
      } else {
        tableHTML += `<td style="padding:8px 12px;border:1px solid #ddd;text-align:center;color:#ccc;">-</td>`;
      }
      // 状态
      tableHTML += `<td style="padding:8px 12px;border:1px solid #ddd;text-align:center;">${statusText[order.status]}</td>`;
      
      tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';

    // 用 HTML 格式导出（.xls 后缀让 Excel 直接打开）
    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<!--[if gte mso 9]>
<xml>
<x:ExcelWorkbook>
<x:ExcelWorksheets>
<x:ExcelWorksheet>
<x:Name>订单列表</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet>
</x:ExcelWorksheets>
</x:ExcelWorkbook>
</xml>
<![endif]-->
</head>
<body>${tableHTML}</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `订单列表_${new Date().toLocaleDateString()}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 生产汇总数据 - 按款式名称分组
  const productionGrouped = (() => {
    const groupMap = new Map<string, { name: string; colors: Map<string, { sizes: Record<string, number>; total: number }> }>();
    for (const order of orders) {
      for (const item of order.items) {
        const productName = item.product.name;
        const color = item.color || '';
        if (!groupMap.has(productName)) {
          groupMap.set(productName, { name: productName, colors: new Map() });
        }
        const group = groupMap.get(productName)!;
        if (!group.colors.has(color)) {
          group.colors.set(color, { sizes: {}, total: 0 });
        }
        const colorEntry = group.colors.get(color)!;
        colorEntry.sizes[item.size] = (colorEntry.sizes[item.size] || 0) + item.quantity;
        colorEntry.total += item.quantity;
      }
    }
    // 转成可渲染的结构
    return Array.from(groupMap.values()).map((group) => {
      const colorRows = Array.from(group.colors.entries()).map(([color, data]) => ({
        color,
        sizes: data.sizes,
        total: data.total,
      }));
      return { name: group.name, colorRows };
    });
  })();

  const exportProductionExcel = () => {
    const headers = ['款式', '颜色', ...ALL_SIZES, '合计'];

    const rows: string[][] = [];
    for (const group of productionGrouped) {
      // 款式标题行
      rows.push([group.name, '', ...ALL_SIZES.map(() => ''), '']);
      // 颜色行
      for (const row of group.colorRows) {
        rows.push([
          '',
          row.color || '-',
          ...ALL_SIZES.map((size) => (row.sizes[size] ? String(row.sizes[size]) : '')),
          String(row.total),
        ]);
      }
      // 款式之间空一行
      rows.push([]);
    }

    // 总合计行
    const grandTotal = ALL_SIZES.map((size) =>
      String(productionGrouped.reduce((sum, g) => sum + g.colorRows.reduce((s, r) => s + (r.sizes[size] || 0), 0), 0))
    );
    const grandTotalAll = String(productionGrouped.reduce((sum, g) => sum + g.colorRows.reduce((s, r) => s + r.total, 0), 0));
    rows.push(['总计', '', ...grandTotal, grandTotalAll]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `生产汇总_${new Date().toLocaleDateString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusClass: Record<string, string> = {
    paid: 'status-paid',
    shipped: 'status-shipped',
  };

  return (
    <div className="admin">
      <div className="admin-header">
        <h1>管理后台</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          订单管理
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          商品管理
        </button>
        <button
          className={`tab-btn ${activeTab === 'banner' ? 'active' : ''}`}
          onClick={() => setActiveTab('banner')}
        >
          Banner 设置
        </button>
        <button
          className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          收款设置
        </button>
        <button
          className={`tab-btn ${activeTab === 'production' ? 'active' : ''}`}
          onClick={() => setActiveTab('production')}
        >
          生产汇总
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>所有订单</h2>
            <button className="export-btn" onClick={exportToExcel}>
              导出 Excel
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="no-data">暂无订单</p>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>买家</th>
                    <th>订单号</th>
                    <th>下单时间</th>
                    <th>商品</th>
                    <th>金额</th>
                    <th>支付凭证</th>
                    <th>状态/操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div>{order.buyerName}</div>
                        <div className="phone-cell">{order.buyerPhone}</div>
                      </td>
                      <td className="order-id-cell">{order.id}</td>
                      <td className="date-cell">
                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="date-time-row">{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="items-cell">
                        {order.items.map((item, i) => (
                          <div key={i} className="order-item-row">
                            {editingItem?.orderId === order.id && editingItem.itemIndex === i ? (
                              <div className="item-edit-panel">
                                <select
                                  value={editForm.color}
                                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                  className="order-edit-select"
                                >
                                  {ALL_COLORS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                                <select
                                  value={editForm.size}
                                  onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                                  className="order-edit-select"
                                >
                                  {ALL_SIZES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  min="1"
                                  value={editForm.quantity}
                                  onChange={(e) => setEditForm({ ...editForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                  className="order-edit-qty"
                                />
                                <button className="confirm-edit-btn" onClick={confirmEditItem}>确认</button>
                                <button className="cancel-edit-btn" onClick={cancelEditItem}>取消</button>
                              </div>
                            ) : (
                              <>
                                <span className="item-name">{item.product.name}</span>
                                {item.color && <span className="item-color">({item.color})</span>}
                                <span className="item-size-qty">{item.size} × {item.quantity}</span>
                                <button
                                  className="edit-item-btn"
                                  onClick={() => startEditingItem(order.id, i)}
                                  title="修改商品信息"
                                >
                                  修改
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </td>
                      <td className="price-cell">¥{order.total.toFixed(2)}</td>
                      <td className="proof-cell">
                        {order.paymentProof ? (
                          <img src={order.paymentProof} alt="支付凭证" className="proof-thumbnail" />
                        ) : (
                          <span className="no-proof">-</span>
                        )}
                      </td>
                      <td className="status-action-cell">
                        <label className="status-checkbox-label">
                          <input
                            type="checkbox"
                            checked={order.status === 'shipped'}
                            onChange={(e) => handleStatusChange(order.id, e.target.checked ? 'shipped' : 'paid')}
                          />
                          <span className={`status-tag tag-shipped ${order.status === 'shipped' ? 'active' : ''}`}>
                            已提货
                          </span>
                        </label>
                        <button
                          className="admin-delete-order-btn"
                          onClick={() => handleDeleteOrder(order.id)}
                          title="删除此订单"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>商品列表</h2>
            <button className="add-btn" onClick={() => setShowForm(true)}>
              + 新增款式
            </button>
          </div>

          {showForm && (
            <div className="form-overlay">
              <form className="product-form" onSubmit={handleSubmit}>
                <h2>{editingId ? '编辑商品' : '新增商品'}</h2>
                <div className="form-scroll">
                  <div className="form-group">
                    <label>名称</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>价格</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>缩略图（首页展示）</label>
                    <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
                      {formData.image ? (
                        <div className="image-preview-wrapper">
                          <img src={formData.image} alt="缩略图预览" className="image-preview" />
                          <button
                            type="button"
                            className="image-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, image: '' });
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="image-upload-placeholder">
                          <span className="upload-icon">+</span>
                          <span>点击上传缩略图</span>
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

                  <div className="form-group">
                    <label>详情图（商品详情页展示）</label>
                    <div className="image-upload-area image-upload-area-detail" onClick={() => detailFileInputRef.current?.click()}>
                      {formData.detailImage ? (
                        <div className="image-preview-wrapper">
                          <img src={formData.detailImage} alt="详情图预览" className="image-preview image-preview-tall" />
                          <button
                            type="button"
                            className="image-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, detailImage: '' });
                              if (detailFileInputRef.current) detailFileInputRef.current.value = '';
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="image-upload-placeholder">
                          <span className="upload-icon">+</span>
                          <span>点击上传详情长图</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={detailFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleDetailImageUpload}
                      hidden
                    />
                  </div>
                  <div className="form-group">
                    <label>描述</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>可选颜色</label>
                    <div className="color-checkboxes">
                      {ALL_COLORS.map((color) => (
                        <label key={color} className="color-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.colors.includes(color)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, colors: [...formData.colors, color] });
                              } else {
                                setFormData({ ...formData, colors: formData.colors.filter((c) => c !== color) });
                              }
                            }}
                          />
                          <span>{color}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="form-tip">尺码固定为：{ALL_SIZES.join(', ')}</p>
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={resetForm}>取消</button>
                  <button type="submit" className="submit-btn">{editingId ? '保存' : '添加'}</button>
                </div>
              </form>
            </div>
          )}

          <div className="product-table">
            <table>
              <thead>
                <tr>
                  <th>图片</th>
                  <th>名称</th>
                  <th>价格</th>
                  <th>尺码</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img src={product.image} alt={product.name} className="table-image" />
                    </td>
                    <td>{product.name}</td>
                    <td>¥{product.price}</td>
                    <td>{product.sizes.join(', ')}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(product)}>编辑</button>
                      <button className="delete-btn" onClick={() => handleDelete(product.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'banner' && (
        <div className="tab-content">
          <h2>Banner 设置</h2>
          <p className="tab-desc">上传后自动生效，首页将直接展示图片原样（建议宽图，宽高比约 3:1 到 5:1）。</p>
          <div className="banner-form">
            <div className="form-group">
              <label>Banner 图片</label>
              <div className="image-upload-area image-upload-banner" onClick={() => bannerFileInputRef.current?.click()}>
                {bannerImage ? (
                  <div className="image-preview-wrapper">
                    <img src={bannerImage} alt="Banner 预览" className="image-preview banner-upload-preview" />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBannerImage('');
                        updateBanner({ image: '' });
                        if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-placeholder">
                    <span className="upload-icon">+</span>
                    <span>点击上传 Banner 图片</span>
                    <span className="upload-hint">上传后首页自动展示</span>
                  </div>
                )}
              </div>
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerImageUpload}
                hidden
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="tab-content">
          <h2>收款设置</h2>
          <p className="tab-desc">配置支付宝收款码，用户下单支付时将展示此二维码。</p>
          <div className="qr-code-section">
            <div className="form-group">
              <label>支付宝收款二维码</label>
              <div className="image-upload-area qr-upload-area" onClick={() => qrCodeFileInputRef.current?.click()}>
                {payQrCode ? (
                  <div className="image-preview-wrapper">
                    <img src={payQrCode} alt="收款码预览" className="image-preview qr-preview" />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updatePayQrCode('');
                        if (qrCodeFileInputRef.current) qrCodeFileInputRef.current.value = '';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-placeholder">
                    <span className="upload-icon">+</span>
                    <span>点击上传收款码</span>
                  </div>
                )}
              </div>
              <input
                ref={qrCodeFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrCodeUpload}
                hidden
              />
            </div>
            {payQrCode && (
              <p className="qr-saved-tip">✅ 收款码已配置，用户支付时将展示此二维码</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'production' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>生产汇总</h2>
            <button className="export-btn" onClick={exportProductionExcel}>
              导出生产单
            </button>
          </div>
          {productionGrouped.length === 0 ? (
            <p className="no-data">暂无订单数据</p>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>款式</th>
                    <th>颜色</th>
                    {ALL_SIZES.map((size) => (
                      <th key={size}>{size}</th>
                    ))}
                    <th>合计</th>
                  </tr>
                </thead>
                <tbody>
                  {productionGrouped.map((group, gi) => (
                    <React.Fragment key={gi}>
                      {/* 款式分组标题行 */}
                      <tr className="group-header-row">
                        <td colSpan={2 + ALL_SIZES.length + 1} className="group-header-cell">
                          {group.name}
                        </td>
                      </tr>
                      {/* 颜色行 */}
                      {group.colorRows.map((row, ri) => (
                        <tr key={`${gi}-${ri}`}>
                          <td></td>
                          <td>{row.color || '-'}</td>
                          {ALL_SIZES.map((size) => (
                            <td key={size} className="qty-cell">
                              {row.sizes[size] || '-'}
                            </td>
                          ))}
                          <td className="qty-cell total-qty">{row.total}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {/* 总合计 */}
                  <tr className="total-row">
                    <td><strong>总计</strong></td>
                    <td></td>
                    {ALL_SIZES.map((size) => (
                      <td key={size} className="qty-cell">
                        <strong>
                          {productionGrouped.reduce((sum, g) => sum + g.colorRows.reduce((s, r) => s + (r.sizes[size] || 0), 0), 0) || '-'}
                        </strong>
                      </td>
                    ))}
                    <td className="qty-cell total-qty">
                      <strong>{productionGrouped.reduce((sum, g) => sum + g.colorRows.reduce((s, r) => s + r.total, 0), 0)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
