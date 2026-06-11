import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function ClientDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, quoted: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' })
      const data = await res.json()
      setRecentOrders(data.slice(0, 5))
      setStats({
        total: data.length,
        pending: data.filter(o => o.status === 'pending').length,
        quoted: data.filter(o => o.status === 'quoted').length
      })
    } catch (e) {
      console.error('Failed to fetch orders:', e)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning/10 text-warning',
      quoted: 'bg-accent/10 text-accent',
      cancelled: 'bg-gray-100 text-text-secondary'
    }
    const labels = { pending: '待报价', quoted: '已报价', cancelled: '已取消' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">我的订单</h1>
          <p className="text-text-secondary mt-1">管理您的货品报价订单</p>
        </div>
        <Link
          to="/client/new-order"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
        >
          <span>➕</span>
          新增订单
        </Link>
      </div>

      {/* Stats Cards */}
 -      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/client/orders" className="bg-white rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-md transition-all fade-in stagger-1 group block cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm group-hover:text-primary transition-colors">订单总数</p>
              <p className="text-3xl font-bold text-text-primary mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </Link>

        <Link to="/client/orders?status=pending" className="bg-white rounded-xl p-6 border border-border hover:border-warning/50 hover:shadow-md transition-all fade-in stagger-2 group block cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm group-hover:text-warning transition-colors">待报价</p>
              <p className="text-3xl font-bold text-warning mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center group-hover:bg-warning/20 transition-colors">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </Link>

        <Link to="/client/orders?status=quoted" className="bg-white rounded-xl p-6 border border-border hover:border-accent/50 hover:shadow-md transition-all fade-in stagger-3 group block cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm group-hover:text-accent transition-colors">已报价</p>
              <p className="text-3xl font-bold text-accent mt-1">{stats.quoted}</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-border overflow-hidden fade-in stagger-4">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-text-primary">最近订单</h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-text-secondary">暂无订单</p>
            <Link
              to="/client/new-order"
              className="inline-block mt-4 text-primary hover:underline"
            >
              创建您的第一个订单
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map(order => (
              <Link
                key={order.id}
                to={`/client/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-text-primary">{order.orderName}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {order.orderNo} · {new Date(order.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </Link>
            ))}
          </div>
        )}

        {recentOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-gray-50">
            <Link to="/client/orders" className="text-primary text-sm font-medium hover:underline">
              查看全部订单 →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
