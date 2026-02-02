import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 头部欢迎 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">欢迎来到疗愈空间</h1>
        <p className="text-xl opacity-90">
          科学训练，健康生活，全面提升身心健康水平
        </p>
      </div>

      {/* 功能卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 凯格尔训练 */}
        <Link
          to="/kegel"
          className="group bg-white/85 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-lg transition-all p-8 border-2 border-transparent hover:border-green-500"
        >
          <div className="flex items-start gap-4">
            <div className="text-5xl group-hover:scale-110 transition-transform">💪</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">凯格尔训练</h2>
              <p className="text-gray-600 mb-4">
                科学训练盆底肌，增强核心力量，提升健康水平
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  三种难度级别可选
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  智能计时提醒
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  训练数据统计
                </li>
              </ul>
            </div>
          </div>
        </Link>

        {/* 身心疗愈 */}
        <Link
          to="/wellness"
          className="group bg-white/85 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-lg transition-all p-8 border-2 border-transparent hover:border-green-500"
        >
          <div className="flex items-start gap-4">
            <div className="text-5xl group-hover:scale-110 transition-transform">🌿</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">身心疗愈</h2>
              <p className="text-gray-600 mb-4">
                关注睡眠、冥想与放松，全面提升生活质量
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  睡眠质量追踪
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  冥想放松练习
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  声音睡眠监测
                </li>
              </ul>
            </div>
          </div>
        </Link>
      </div>

      {/* 健康小贴士 */}
      <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">💡 健康小贴士</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50/80 rounded-lg p-4">
            <div className="text-2xl mb-2">😴</div>
            <h4 className="font-bold text-gray-900 mb-1">规律睡眠</h4>
            <p className="text-sm text-gray-600">每天保证7-8小时优质睡眠</p>
          </div>
          <div className="bg-green-50/80 rounded-lg p-4">
            <div className="text-2xl mb-2">🏃</div>
            <h4 className="font-bold text-gray-900 mb-1">适度运动</h4>
            <p className="text-sm text-gray-600">每周坚持3-5次有氧运动</p>
          </div>
          <div className="bg-yellow-50/80 rounded-lg p-4">
            <div className="text-2xl mb-2">🥗</div>
            <h4 className="font-bold text-gray-900 mb-1">均衡饮食</h4>
            <p className="text-sm text-gray-600">多吃蔬果，少吃油腻</p>
          </div>
        </div>
      </div>
    </div>
  )
}
