import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/kegel', label: '凯格尔训练', icon: '💪' },
    { path: '/wellness', label: '身心疗愈', icon: '🌿' },
  ]

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-bold text-gray-900">疗愈空间</span>
            </div>

            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-green-500 text-white'
                      : 'text-gray-600 hover:bg-green-50'
                  }`}
                >
                  <span className="hidden sm:inline">{item.icon} </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-green-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2026 疗愈空间 - 关注健康，享受生活🌿
          </p>
        </div>
      </footer>
    </div>
  )
}
