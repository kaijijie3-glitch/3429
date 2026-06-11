import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setStats({
          total: data.length,
          pending: data.filter(o => o.status === 'pending').length,
          quoted: data.filter(o => o.status === 'quoted').length
        });
      }
    } catch (err) {
      console.error('获取订单失败', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning/10 text-warning',
      quoted: 'bg-accent/10 text-accent',
      cancelled: 'bg-gray/10 text-gray'
    };
    const labels = { pending: '待报价', quoted: '已报价', cancelled: '已取消' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'goods_handler': return '货物处理员';
      case 'logistics_handler': return '物流处理员';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">工作台</h1>
          <p className="text-text-secondary mt-1">
            {getRoleLabel(user?.role)} - {user?.username}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-text-secondary text-sm">全部订单</p>
          <p className="text-3xl font-bold text-text-primary mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-text-secondary text-sm">待处理</p>
          <p className="text-3xl font-bold text-warning mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-text-secondary text-sm">已完成</p>
          <p className="text-3xl font-bold text-accent mt-1">{stats.quoted}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">订单列表</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-text-secondary">暂无分配给您的订单</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/staff/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text-primary">{order.orderName}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    {order.orderNo} · {new Date(order.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span className="text-text-secondary text-sm">查看 →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
