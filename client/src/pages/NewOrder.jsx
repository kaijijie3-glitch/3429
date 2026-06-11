import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function SubOrderForm({ index, subOrder, onUpdate, onRemove }) {
  const handleSizeChange = (size, value) => {
    const num = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    onUpdate(index, 'sizes', { ...subOrder.sizes, [size]: num });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(index, 'image', data.url);
      }
    } catch (err) {
      console.error('上传失败', err);
    }
  };

  const totalQty = Object.values(subOrder.sizes).reduce((sum, v) => sum + (parseInt(v) || 0), 0);

  return (
    <div className="bg-white border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">子订单 {index + 1}</h3>
        {index > 0 && (
          <button
          onClick={() => onRemove(index)}
          className="text-danger hover:text-danger/80 text-sm font-medium"
        >
          删除
        </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            货品名称 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={subOrder.productName}
            onChange={(e) => onUpdate(index, 'productName', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="请输入货品名称"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            货品图片
          </label>
          {subOrder.image ? (
            <div className="flex items-center gap-3">
              <img
                src={subOrder.image}
                alt="产品"
                className="w-16 h-16 object-cover rounded-lg border border-border"
              />
              <button
                onClick={() => onUpdate(index, 'image', '')}
                className="text-danger text-sm hover:underline"
              >
                移除
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-gray-50">
              <span className="text-text-secondary text-sm">
              点击上传图片
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">
          货品描述
        </label>
        <textarea
          value={subOrder.productDesc}
          onChange={(e) => onUpdate(index, 'productDesc', e.target.value)}
          rows={2}
          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          placeholder="请输入货品描述（可选）"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-text-primary">
            尺码数量 <span className="text-danger">*</span>
          </label>
          <span className="text-sm text-text-secondary">合计: <span className="font-mono font-medium">{totalQty}</span> 件</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {SIZES.map(size => (
            <div key={size} className="flex flex-col gap-2">
              <span className="text-sm text-text-secondary text-center">{size}</span>
              <input
                type="number"
                min="0"
                value={subOrder.sizes[size] || ''}
                onChange={(e) => handleSizeChange(size, e.target.value)}
                className="w-full px-2 py-2 border border-border rounded-lg text-center focus:ring-2 focus:ring-primary focus:border-primary font-mono"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NewOrder() {
  const [orderName, setOrderName] = useState('');
  const [orderDesc, setOrderDesc] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [subOrders, setSubOrders] = useState([
    { productName: '', productDesc: '', image: '', sizes: {} }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAddSubOrder = () => {
    setSubOrders([...subOrders, { productName: '', productDesc: '', image: '', sizes: {} }]);
  };

  const handleUpdateSubOrder = (index, field, value) => {
    const updated = [...subOrders];
    updated[index] = { ...updated[index], [field]: value };
    setSubOrders(updated);
  };

  const handleRemoveSubOrder = (index) => {
    const updated = subOrders.filter((_, i) => i !== index);
    setSubOrders(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!orderName.trim()) {
      setError('请输入订单名称');
      return;
    }

    const validSubOrders = subOrders.filter(so => so.productName.trim() && Object.keys(so.sizes).length > 0);
    if (validSubOrders.length === 0) {
      setError('请至少添加一个有效的子订单');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderName,
          orderDesc,
          contactName,
          phone,
          address,
          subOrders: validSubOrders
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '创建订单失败');
      }

      navigate('/client/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="mb-6">
        <Link
          to="/client/orders"
          className="text-primary text-sm hover:underline mb-2 inline-block"
        >
          ← 返回订单列表
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">创建订单</h1>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger text-sm p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">订单信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                订单名称 <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="请输入订单名称"
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-text-primary mb-2">
                联系人
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="请输入联系人姓名"
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-text-primary mb-2">
                联系电话
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="请输入联系电话"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                收货地址
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="请输入详细收货地址"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                订单描述
              </label>
              <textarea
                value={orderDesc}
                onChange={(e) => setOrderDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="请输入订单描述（可选）"
              />
            </div>
          </div>
          </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">子订单</h2>
            <button
              type="button"
              onClick={handleAddSubOrder}
              className="text-primary text-sm font-medium hover:text-primary/80"
            >
              + 添加子订单
            </button>
          </div>

          {subOrders.map((subOrder, index) => (
            <SubOrderForm
              key={index}
              index={index}
              subOrder={subOrder}
              onUpdate={handleUpdateSubOrder}
              onRemove={handleRemoveSubOrder}
            />
          ))}
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/client')}
            className="flex-1 px-4 py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : '提交订单'}
          </button>
        </div>
      </form>
    </div>
  );
}
