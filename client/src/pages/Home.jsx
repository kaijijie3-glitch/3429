import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  // 如果用户已经登录，直接跳转到对应的后台页面
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'goods_handler' || user.role === 'logistics_handler') return <Navigate to="/staff" replace />
    return <Navigate to="/client" replace />
  }

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
                className="px-5 py-2.5 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg font-medium transition-all duration-200"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium shadow-sm shadow-primary/30 hover:bg-secondary hover:shadow-primary/50 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 sm:pt-32 sm:pb-36 overflow-hidden fade-in">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-40 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 animate-pulse-slow">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              全新一代智能报价系统
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary mb-8 tracking-tight leading-tight">
              让商业报价 <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                更智能、更高效
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
              为现代企业打造的一站式货品报价管理平台。连接客户与管理员，化繁为简，让每一次商业合作都完美落地。
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg shadow-primary/30 hover:bg-secondary hover:shadow-primary/50 transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                免费开始使用
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-border text-text-primary rounded-xl font-semibold text-lg hover:border-primary hover:text-primary transition-all duration-200 flex items-center justify-center"
              >
                登录管理后台
              </Link>
            </div>
            
            {/* Dashboard Preview Image mockup */}
            <div className="mt-20 relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
              <div className="rounded-2xl border border-border/50 bg-white/50 backdrop-blur-sm shadow-2xl p-2 sm:p-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
                  {/* Mock browser header */}
                  <div className="h-10 border-b border-border bg-gray-50 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger/80"></div>
                    <div className="w-3 h-3 rounded-full bg-warning/80"></div>
                    <div className="w-3 h-3 rounded-full bg-accent/80"></div>
                  </div>
                  {/* Mock content */}
                  <div className="p-6 grid grid-cols-4 gap-4 h-64 opacity-80">
                    <div className="col-span-1 border-r border-border pr-4 space-y-4">
                      <div className="h-8 bg-gray-100 rounded-md"></div>
                      <div className="h-8 bg-primary/10 rounded-md"></div>
                      <div className="h-8 bg-gray-100 rounded-md"></div>
                    </div>
                    <div className="col-span-3 space-y-4">
                      <div className="flex gap-4">
                        <div className="h-24 flex-1 bg-primary/5 rounded-xl border border-primary/10"></div>
                        <div className="h-24 flex-1 bg-warning/5 rounded-xl border border-warning/10"></div>
                        <div className="h-24 flex-1 bg-accent/5 rounded-xl border border-accent/10"></div>
                      </div>
                      <div className="h-32 bg-gray-50 rounded-xl border border-border"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white fade-in stagger-1 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-primary tracking-wide uppercase mb-3">核心优势</h2>
            <h3 className="text-4xl font-bold text-text-primary mb-4">为什么选择我们的系统？</h3>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              摆脱繁琐的传统报价流程，享受自动化带来的高效与便捷
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-background rounded-3xl p-10 border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <span className="text-4xl">📝</span>
              </div>
              <h4 className="text-2xl font-semibold text-text-primary mb-4">极速下单体验</h4>
              <p className="text-text-secondary leading-relaxed text-lg">
                客户通过可视化界面快速录入商品信息和多尺码数据，一键提交需求，告别混乱的表格和聊天记录。
              </p>
            </div>
            <div className="bg-background rounded-3xl p-10 border border-border hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <span className="text-4xl">⚡️</span>
              </div>
              <h4 className="text-2xl font-semibold text-text-primary mb-4">智能报价引擎</h4>
              <p className="text-text-secondary leading-relaxed text-lg">
                管理员收到订单提醒，在线批量填写各尺码单价，系统自动计算总金额，生成专业报价单据。
              </p>
            </div>
            <div className="bg-background rounded-3xl p-10 border border-border hover:border-warning/30 hover:shadow-xl hover:shadow-warning/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/5 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <span className="text-4xl">📊</span>
              </div>
              <h4 className="text-2xl font-semibold text-text-primary mb-4">全生命周期追踪</h4>
              <p className="text-text-secondary leading-relaxed text-lg">
                从待报价、已报价到取消，多状态实时同步。强大的后台图表让管理者轻松掌控全局数据。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background fade-in stagger-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-primary tracking-wide uppercase mb-3">使用流程</h2>
            <h3 className="text-4xl font-bold text-text-primary mb-4">三步轻松完成报价协作</h3>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              清晰透明的业务流程，让每一次合作都建立在信任之上
            </p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-border z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-border group hover:border-primary transition-colors">
                  <span className="text-primary font-bold text-3xl">1</span>
                </div>
                <h4 className="text-xl font-semibold text-text-primary mb-3">客户提交订单</h4>
                <p className="text-text-secondary text-lg">
                  注册账户后，详细填写您的货品款式及各尺码所需的数量并一键提交
                </p>
              </div>
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-border group hover:border-warning transition-colors">
                  <span className="text-warning font-bold text-3xl">2</span>
                </div>
                <h4 className="text-xl font-semibold text-text-primary mb-3">平台快速审核报价</h4>
                <p className="text-text-secondary text-lg">
                  管理员接收到需求，即刻在线评估并录入极具竞争力的精准单价
                </p>
              </div>
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-border group hover:border-accent transition-colors">
                  <span className="text-accent font-bold text-3xl">3</span>
                </div>
                <h4 className="text-xl font-semibold text-text-primary mb-3">确认报价及生产</h4>
                <p className="text-text-secondary text-lg">
                  客户实时收到报价详情，双方确认无误后即可安排后续处理流程
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden fade-in stagger-3">
        <div className="absolute inset-0 bg-primary z-0"></div>
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] z-0"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">准备好提升您的业务效率了吗？</h2>
          <p className="text-primary-50 text-xl mb-10 text-white/90">
            加入我们，用数字化工具赋能您的日常报价管理，让您的团队更加专注于业务增长。
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-gray-50 shadow-xl shadow-black/10 transition-all duration-200 transform hover:-translate-y-1"
            >
              创建免费账户
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-200"
            >
              登录已有账户
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
