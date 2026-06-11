import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">报</span>
              </div>
              <span className="font-semibold text-xl text-text-primary">报价系统</span>
            </div>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-text-secondary hover:text-text-primary font-medium transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="text-white font-bold text-4xl">报</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              专业货品报价管理
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
              为客户和管理员提供高效的订单与报价管理流程，让商业合作更简单
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-secondary transition-colors"
              >
                免费注册
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-border text-text-primary rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                立即登录
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white border-t border-border fade-in stagger-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">核心功能</h2>
            <p className="text-text-secondary">简单易用的功能，提升工作效率</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">快速下单</h3>
              <p className="text-text-secondary">
                客户只需填写货品信息和尺码数量，一键提交订单，简单高效
              </p>
            </div>
            <div className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">便捷报价</h3>
              <p className="text-text-secondary">
                管理员查看订单后，为各尺码填写单价，快速生成报价单
              </p>
            </div>
            <div className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-warning/10 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">订单管理</h3>
              <p className="text-text-secondary">
                清晰的订单状态展示，轻松追踪订单进度，历史记录随时查看
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 fade-in stagger-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">使用流程</h2>
            <p className="text-text-secondary">三步完成订单与报价</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">客户提交订单</h3>
              <p className="text-text-secondary">客户注册账户后，填写货品信息和尺码数量提交订单</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">管理员报价</h3>
              <p className="text-text-secondary">管理员查看订单后，为各尺码填写单价完成报价</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">查看报价</h3>
              <p className="text-text-secondary">客户查看报价详情，了解各尺码价格和总价</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary fade-in stagger-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">开始使用报价系统</h2>
          <p className="text-white/80 text-lg mb-8">
            注册账户，立即体验便捷的订单与报价管理
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              立即注册
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              登录账户
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">报</span>
              </div>
              <span className="font-semibold text-text-primary">报价系统</span>
            </div>
            <p className="text-text-secondary text-sm">
              © 2024 报价系统 - 专业货品报价管理
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
