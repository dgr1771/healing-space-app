/**
 * 凯格尔训练页面
 */

import { useState, useEffect } from 'react'
import { kegelService } from '@services/kegelService'
import KegelTimer from './KegelTimer'
import KegelStats from './KegelStats'
import KegelHistory from './KegelHistory'

export default function KegelPage() {
  const [activeTab, setActiveTab] = useState<'train' | 'stats' | 'history'>('train')
  const [session, setSession] = useState<any>(null)

  // 自动记录登录/访问
  useEffect(() => {
    const recordVisit = async () => {
      try {
        await kegelService.recordLogin()
      } catch (error) {
        console.error('记录登录失败:', error)
        // 不阻塞页面渲染
      }
    }
    recordVisit()
  }, [])

  return (
    <div className="animate-fade-in space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💪 凯格尔训练</h1>
          <p className="text-gray-600 mt-1">
            科学训练盆底肌，提升整体健康
          </p>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
        <button
          onClick={() => setActiveTab('train')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'train'
              ? 'bg-[#007AFF] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🏋️ 开始训练
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'stats'
              ? 'bg-[#007AFF] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📊 统计数据
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-[#007AFF] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📚 训练记录
        </button>
      </div>

      {/* 内容区域 */}
      {activeTab === 'train' && <KegelTimer session={session} setSession={setSession} />}
      {activeTab === 'stats' && <KegelStats />}
      {activeTab === 'history' && <KegelHistory />}
    </div>
  )
}
