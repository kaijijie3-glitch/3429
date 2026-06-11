import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrderNo, setFilterOrderNo] = useState('');
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterOrderNo]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterOrderNo) params.append('orderNo', filterOrderNo);

      const res = await fetch(`/api/orders?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      setOrders(data);
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">订单列表</h1>
        </div>
        {user?.role === 'client' && (
          <Link
            to="/client/new-order"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            <span>+</span>
            新增订单
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">订单号</label>
            <input
              type="text"
              value={filterOrderNo}
              onChange={(e) => setFilterOrderNo(e.target.value)}
              placeholder="输入订单号搜索"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">状态</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">全部</option>
              <option value="pending">待报价</option>
              <option value="quoted">已报价</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-text-secondary">暂无订单</p>
            {user?.role === 'client' && (
              <Link
                to="/client/new-order"
                className="inline-block mt-4 text-primary hover:underline"
              >
                创建第一个订单
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map(order => (
              <Link
                key={order.id}
                to={user?.role === 'admin' ? `/admin/orders/${order.id}` : `/client/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text-primary">{order.orderName}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    {order.orderNo}
                    {order.client_name && ` · ${order.client_name}`}
                    {` · ${new Date(order.created_at).toLocaleDateString('zh-CN')}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {user?.role === 'admin' && order.status === 'pending' && (
                    <Link
                      to={`/admin/orders/${order.id}/quote`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-warning hover:text-warning/80 text-sm font-medium"
                    >
                      报价
                    </Link>
                  )}
                  <span className="text-text-secondary text-sm">查看 →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
