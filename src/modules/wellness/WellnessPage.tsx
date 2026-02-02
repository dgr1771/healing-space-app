/**
 * 身心疗愈页面 - iOS 风格
 */

import { useState } from 'react'
import SleepTracker from './SleepTracker'
import SleepMonitor from './SleepMonitor'
import MeditationTimer from './MeditationTimer'
import WellnessOverview from './WellnessOverview'

type TabType = 'overview' | 'sleep-record' | 'sleep-monitor' | 'meditation'

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 页面标题 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">🌿 身心疗愈</h1>
        <p className="text-sm text-gray-500 mt-1">关注您的身心健康</p>
      </div>

      {/* Tab切换 - iOS Segmented Control 风格 */}
      <div className="bg-white px-6 py-4">
        <div className="bg-gray-200 rounded-xl p-1 flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-[#007AFF] shadow-sm'
                : 'text-gray-600'
            }`}
          >
            📊 总览
          </button>
          <button
            onClick={() => setActiveTab('sleep-monitor')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'sleep-monitor'
                ? 'bg-white text-[#007AFF] shadow-sm'
                : 'text-gray-600'
            }`}
          >
            🎤 睡眠监测
          </button>
          <button
            onClick={() => setActiveTab('sleep-record')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'sleep-record'
                ? 'bg-white text-[#007AFF] shadow-sm'
                : 'text-gray-600'
            }`}
          >
            😴 睡眠记录
          </button>
          <button
            onClick={() => setActiveTab('meditation')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'meditation'
                ? 'bg-white text-[#007AFF] shadow-sm'
                : 'text-gray-600'
            }`}
          >
            🧘 冥想
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 py-4">
        {activeTab === 'overview' && <WellnessOverview />}
        {activeTab === 'sleep-record' && <SleepTracker />}
        {activeTab === 'sleep-monitor' && <SleepMonitor />}
        {activeTab === 'meditation' && <MeditationTimer />}
      </div>
    </div>
  )
}
