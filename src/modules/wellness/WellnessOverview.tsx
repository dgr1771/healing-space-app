/**
 * 身心疗愈总览组件
 * 使用本地存储，无需后端支持
 */

import { useEffect, useState } from 'react'
import { localSleepService } from '@services/localSleepService'
import { type WellnessStats } from '../../types/wellness'

export default function WellnessOverview() {
  const [stats, setStats] = useState<WellnessStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await localSleepService.getStats()
      setStats(data)
    } catch (error) {
      console.error('加载统计数据失败:', error)
      setStats(null)
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
        <p className="text-sm mt-2">开始记录睡眠和冥想，这里将显示您的健康数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 睡眠统计 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">😴</span>
          <h3 className="text-xl font-bold text-gray-900">睡眠统计</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 mb-1">平均睡眠时长</div>
            <div className="text-2xl font-bold text-purple-900">
              {stats.sleep.averageDuration.toFixed(1)} 小时
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 mb-1">平均睡眠质量</div>
            <div className="text-2xl font-bold text-purple-900">
              {'⭐'.repeat(Math.round(stats.sleep.averageQuality))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 mb-1">连续记录</div>
            <div className="text-2xl font-bold text-purple-900">
              {stats.sleep.currentStreak} 天
            </div>
          </div>
        </div>
      </div>

      {/* 冥想统计 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🧘</span>
          <h3 className="text-xl font-bold text-gray-900">冥想统计</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">总冥想次数</div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.meditation.totalSessions} 次
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">总冥想时长</div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.meditation.totalMinutes} 分钟
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">连续练习</div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.meditation.currentStreak} 天
            </div>
          </div>
        </div>
      </div>

      {/* 健康建议 */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-sm p-6 text-white">
        <h3 className="text-xl font-bold mb-4">💡 健康建议</h3>

        <div className="space-y-3">
          {stats.sleep.averageDuration < 7 && (
            <div className="flex items-start gap-2">
              <span>😴</span>
              <p>你的睡眠时间偏少，建议保证7-8小时的充足睡眠</p>
            </div>
          )}

          {stats.meditation.currentStreak === 0 && (
            <div className="flex items-start gap-2">
              <span>🧘</span>
              <p>开始每天冥想练习，有助于减轻压力和提升专注力</p>
            </div>
          )}

          {stats.sleep.averageDuration >= 7 && stats.meditation.currentStreak > 0 && (
            <div className="flex items-start gap-2">
              <span>🎉</span>
              <p>您的身心疗愈习惯非常好，继续保持！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
