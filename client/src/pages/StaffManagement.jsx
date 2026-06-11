import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'goods_handler'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error('获取员工列表失败', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '创建失败');
      }

      setFormData({ username: '', password: '', role: 'goods_handler' });
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除该员工吗？')) return;

    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchStaff();
      }
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'goods_handler': return '货物处理员';
      case 'logistics_handler': return '物流处理员';
      default: return role;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">员工管理</h1>
          <p className="text-text-secondary mt-1">管理系统员工账号</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
        >
          <span>+</span>
          添加员工
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {staff.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-secondary">暂无员工</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 text-sm font-medium text-text-secondary">
              <div className="col-span-3">用户名</div>
              <div className="col-span-3">角色</div>
              <div className="col-span-4">创建时间</div>
              <div className="col-span-2 text-right">操作</div>
            </div>
            {staff.map((s) => (
              <div key={s.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-3 font-medium text-text-primary">{s.username}</div>
                <div className="col-span-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                    {getRoleLabel(s.role)}
                  </span>
                </div>
                <div className="col-span-4 text-text-secondary text-sm">
                  {new Date(s.created_at).toLocaleDateString('zh-CN')}
                </div>
                <div className="col-span-2 text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-danger hover:text-danger/80 text-sm font-medium"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-6">添加员工</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入用户名"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  密码
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入密码"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  角色
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="goods_handler">货物处理员</option>
                  <option value="logistics_handler">物流处理员</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
