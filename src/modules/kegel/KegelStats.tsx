/**
 * 凯格尔训练统计组件
 */

import { useEffect, useState } from 'react'
import { kegelService } from '@services/kegelService'
import { type KegelStats } from '../../types/kegel'

export default function KegelStats() {
  const [stats, setStats] = useState<KegelStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await kegelService.getStats()
      setStats(data)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p>加载中...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
        <div className="text-4xl mb-4">📊</div>
        <p>暂无统计数据</p>
      </div>
    )
  }

  const levelName = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  }

  return (
    <div className="space-y-6">
      {/* 总览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">总训练次数</span>
            <span className="text-2xl">🏋️</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalExercises}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">总时长</span>
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {Math.floor(stats.totalTime / 60)}分{stats.totalTime % 60}秒
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">当前连续</span>
            <span className="text-2xl">🔥</span>
          </div>
          <div className="text-3xl font-bold text-orange-500">{stats.currentStreak}天</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">总登录天数</span>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-3xl font-bold text-blue-500">{stats.loginDays}天</div>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">详细统计</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-600">最长连续天数</span>
            <span className="text-xl font-bold text-gray-900">{stats.longestStreak} 天</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-600">本周训练</span>
            <span className="text-xl font-bold text-gray-900">{stats.thisWeekCount} 次</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-600">本月训练</span>
            <span className="text-xl font-bold text-gray-900">{stats.thisMonthCount} 次</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span className="text-[#007AFF] font-medium">当前等级</span>
            <span className="text-xl font-bold text-[#007AFF]">{levelName[stats.level]}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
