import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return '管理员'
      case 'client': return '客户'
      case 'goods_handler': return '货物处理员'
      case 'logistics_handler': return '物流处理员'
      default: return role
    }
  }

  const getLinks = () => {
    if (user?.role === 'admin') {
      return [
        { to: '/admin', label: '订单管理', icon: '📋' },
        { to: '/admin/staff', label: '员工管理', icon: '👥' },
      ]
    } else if (user?.role === 'goods_handler' || user?.role === 'logistics_handler') {
      return [
        { to: '/staff', label: '工作台', icon: '📊' },
      ]
    } else {
      return [
        { to: '/client', label: '我的订单', icon: '📋' },
        { to: '/client/new-order', label: '新增订单', icon: '➕' },
      ]
    }
  }

  const getHomePath = () => {
    if (user?.role === 'admin') return '/admin'
    if (user?.role === 'goods_handler' || user?.role === 'logistics_handler') return '/staff'
    return '/client'
  }

  const links = getLinks()
  const homePath = getHomePath()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">报</span>
              </div>
              <span className="font-semibold text-lg text-text-primary">报价系统</span>
              <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {getRoleLabel(user?.role)}
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === homePath}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
                    }`
                  }
                >
                  <span>{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-text-secondary">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-text-secondary hover:text-danger transition-colors"
              >
                退出
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-3">
            <div className="flex flex-col gap-2">
              {links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === homePath}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
                    }`
                  }
                >
                  <span>{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-text-secondary">
          © 2024 报价系统 - 专业货品报价管理
        </div>
      </footer>
    </div>
  )
}
