import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, quoted: 0, clients: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersRes, clientsRes] = await Promise.all([
        fetch('/api/orders', { credentials: 'include' }),
        fetch('/api/clients', { credentials: 'include' })
      ])
      const orders = await ordersRes.json()
      const clients = await clientsRes.json()

      setRecentOrders(orders.filter(o => o.status === 'pending').slice(0, 5))
      setStats({
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        quoted: orders.filter(o => o.status === 'quoted').length,
        clients: clients.length
      })
    } catch (e) {
      console.error('Failed to fetch data:', e)
    } finally {
      setLoading(false)
    }
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
      <div>
        <h1 className="text-2xl font-bold text-text-primary">管理后台</h1>
        <p className="text-text-secondary mt-1">查看和处理客户报价订单</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-border fade-in stagger-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">总订单数</p>
              <p className="text-3xl font-bold text-text-primary mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-border fade-in stagger-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">待报价</p>
              <p className="text-3xl font-bold text-warning mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-border fade-in stagger-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">已报价</p>
              <p className="text-3xl font-bold text-accent mt-1">{stats.quoted}</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-border fade-in stagger-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">客户数</p>
              <p className="text-3xl font-bold text-text-primary mt-1">{stats.clients}</p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-white rounded-xl border border-border overflow-hidden fade-in stagger-5">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">待报价订单</h2>
          <Link to="/admin/orders" className="text-primary text-sm font-medium hover:underline">
            查看全部 →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-text-secondary">暂无待报价订单</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-text-primary">{order.orderName}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    订单号: {order.orderNo} · 账号: {order.client_name} · 电话: {order.phone || '未填写'} · {new Date(order.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <Link
                  to={`/admin/orders/${order.id}/quote`}
                  className="bg-warning text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-warning/90 transition-colors"
                >
                  录入报价
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
