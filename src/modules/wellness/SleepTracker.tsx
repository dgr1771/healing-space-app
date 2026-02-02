/**
 * 睡眠追踪组件
 * 使用本地存储，无需后端支持
 */

import { useState, useEffect } from 'react'
import { localSleepService } from '@services/localSleepService'
import { type SleepRecord } from '../../types/wellness'

export default function SleepTracker() {
  const [records, setRecords] = useState<SleepRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // 表单状态
  const [formData, setFormData] = useState({
    bedTime: '',
    wakeTime: '',
    quality: 4,
    mood: '不错',
    notes: '',
  })

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      setLoading(true)
      const data = await localSleepService.getSleepRecords({ limit: 30 })
      setRecords(data)
    } catch (error) {
      console.error('加载睡眠记录失败:', error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await localSleepService.createSleepRecord({
        bedTime: formData.bedTime,
        wakeTime: formData.wakeTime,
        quality: formData.quality as 1 | 2 | 3 | 4 | 5,
        mood: formData.mood,
        notes: formData.notes || undefined,
      })

      // 重置表单
      setFormData({
        bedTime: '',
        wakeTime: '',
        quality: 4,
        mood: '不错',
        notes: '',
      })
      setShowForm(false)
      loadRecords()
    } catch (error) {
      console.error('保存睡眠记录失败:', error)
      alert('保存失败，请重试')
    }
  }

  const calculateDuration = (bedTime: string, wakeTime: string) => {
    const bed = new Date(bedTime)
    const wake = new Date(wakeTime)
    const diff = (wake.getTime() - bed.getTime()) / 1000 / 60 / 60
    return diff > 0 ? diff : diff + 24
  }

  const qualityStars = (quality: number) => {
    return '⭐'.repeat(quality) + '☆'.repeat(5 - quality)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div>
      {/* 添加记录按钮 */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 bg-[#007AFF] text-white rounded-xl font-medium shadow-sm hover:bg-blue-600 active:scale-95 transition-all mb-4"
        >
          + 快速记录睡眠
        </button>
      )}

      {/* 添加表单 */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">快速记录</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  入睡时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.bedTime}
                  onChange={(e) => setFormData({ ...formData, bedTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  醒来时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.wakeTime}
                  onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                睡眠质量: {qualityStars(formData.quality)}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                醒来心情
              </label>
              <select
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              >
                <option value="很差">😫 很差</option>
                <option value="较差">😕 较差</option>
                <option value="一般">😐 一般</option>
                <option value="不错">🙂 不错</option>
                <option value="很好">😊 很好</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注 (可选)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                rows={3}
                placeholder="记录下任何影响睡眠的因素..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors active:scale-95"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors active:scale-95"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 睡眠记录列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">睡眠记录</h3>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-4">😴</div>
            <p>还没有睡眠记录，记录第一晚吧！</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {records.map((record) => {
              const duration = calculateDuration(record.bedTime, record.wakeTime)
              const hasMonitorData = record.snoreCount !== undefined || record.talkingCount !== undefined || record.goldenSleepTime !== undefined
              const sleepTalkingEvents = record.events?.filter(e => e.type === 'sleep_talking') || []

              return (
                <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {/* 记录头部：星级、日期、标签 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{qualityStars(record.quality)}</span>
                      <span className="text-gray-500 font-medium">
                        {new Date(record.bedTime).toLocaleDateString('zh-CN')}
                      </span>
                      {record.mood === '自动记录' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          🎤 监测记录
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 基本信息网格 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs mb-1">入睡</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {new Date(record.bedTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs mb-1">醒来</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {new Date(record.wakeTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs mb-1">时长</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {Math.floor(duration)}h{Math.round((duration % 1) * 60)}m
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs mb-1">心情</div>
                      <div className="font-medium text-gray-900 text-sm">{record.mood}</div>
                    </div>
                  </div>

                  {/* 睡眠监测数据统计 */}
                  {hasMonitorData && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-2 font-medium">📊 监测数据</div>
                      <div className="grid grid-cols-3 gap-2">
                        {record.snoreCount !== undefined && (
                          <div className="text-center">
                            <div className="text-blue-600 font-bold">💤 {record.snoreCount}</div>
                            <div className="text-blue-600 text-xs">打鼾</div>
                          </div>
                        )}
                        {record.talkingCount !== undefined && (
                          <div className="text-center">
                            <div className="text-purple-600 font-bold">💬 {record.talkingCount}</div>
                            <div className="text-purple-600 text-xs">梦话</div>
                          </div>
                        )}
                        {record.goldenSleepTime !== undefined && (
                          <div className="text-center">
                            <div className="text-yellow-600 font-bold">⭐ {Math.round(record.goldenSleepTime)}分</div>
                            <div className="text-yellow-600 text-xs">黄金睡眠</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 梦话记录详情 */}
                  {sleepTalkingEvents.length > 0 && (
                    <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                      <div className="text-xs text-purple-700 font-medium mb-2">💬 梦话记录 ({sleepTalkingEvents.length}条)</div>
                      <div className="space-y-2">
                        {sleepTalkingEvents.map((event, idx) => {
                          // 将 Base64 音频数据转换为 URL
                          const audioSrc = event.audioData
                            ? `data:audio/webm;base64,${event.audioData}`
                            : event.audioUrl

                          return (
                            <div key={idx} className="bg-white rounded-lg p-2 border border-purple-200">
                              <div className="flex items-center gap-2 text-xs text-purple-600 mb-1">
                                <span>⏰ {new Date(event.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>·</span>
                                <span>{Math.round(event.duration / 1000)}秒</span>
                                {audioSrc && <span>·</span>}
                                {audioSrc && <span className="text-green-600">🎵 有录音</span>}
                              </div>
                              {event.transcript && (
                                <div className="text-sm text-gray-800 bg-gray-50 rounded p-2 mt-1">
                                  {event.transcript}
                                </div>
                              )}
                              {audioSrc && (
                                <audio src={audioSrc} controls className="w-full h-8 mt-2" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* 备注 */}
                  {record.notes && (
                    <div className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                      📝 {record.notes}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
