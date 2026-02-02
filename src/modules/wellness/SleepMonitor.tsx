/**
 * iOS 风格睡眠监测组件
 * 支持音频录制、打鼾检测、梦话录制
 * 支持白噪音播放
 * 使用本地存储，无需后端支持
 */

import { useState, useEffect, useRef } from 'react'
import { audioMonitor, SleepEventData } from '@services/audioService'
import { localSleepService } from '@services/localSleepService'
import { whiteNoiseService, WhiteNoiseType } from '@services/whiteNoiseService'

interface SleepMonitorProps {
  onSleepComplete?: (data: {
    duration: number
    events: SleepEventData[]
    goldenSleepTime: number
    snoreCount: number
    talkingCount: number
  }) => void
}

export default function SleepMonitor({ onSleepComplete }: SleepMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [sleepStartTime, setSleepStartTime] = useState<number | null>(null)
  const [currentDuration, setCurrentDuration] = useState(0)
  const [sleepEvents, setSleepEvents] = useState<SleepEventData[]>([])
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const timerRef = useRef<number>()

  // 白噪音状态
  const [showWhiteNoise, setShowWhiteNoise] = useState(false)
  const [selectedNoise, setSelectedNoise] = useState<string | null>(null)
  const [noiseVolume, setNoiseVolume] = useState(0.5)
  const [customNoises, setCustomNoises] = useState<WhiteNoiseType[]>([])
  const [showNoiseUpload, setShowNoiseUpload] = useState(false)

  // 计算黄金睡眠时间（22:00 - 02:00）
  const calculateGoldenSleepTime = (startTime: number, endTime: number): number => {
    const start = new Date(startTime)
    const end = new Date(endTime)

    // 定义黄金睡眠时段
    const goldenStart = new Date(start)
    goldenStart.setHours(22, 0, 0, 0)
    const goldenEnd = new Date(start)
    goldenEnd.setHours(26, 0, 0, 0) // 02:00

    let goldenMinutes = 0

    // 检查睡眠时间段与黄金时段的重叠
    const sleepStart = start.getTime()
    const sleepEnd = end.getTime()

    if (sleepEnd > goldenStart.getTime() && sleepStart < goldenEnd.getTime()) {
      const overlapStart = Math.max(sleepStart, goldenStart.getTime())
      const overlapEnd = Math.min(sleepEnd, goldenEnd.getTime())
      goldenMinutes = (overlapEnd - overlapStart) / (1000 * 60)
    }

    return Math.round(goldenMinutes)
  }

  // 初始化音频监控
  const initializeAudio = async () => {
    try {
      await audioMonitor.initialize()
      setHasPermission(true)
      setIsInitialized(true)
    } catch (error) {
      console.error('初始化失败:', error)
      setHasPermission(false)
    }
  }

  // 白噪音上传处理
  const handleNoiseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const noise = whiteNoiseService.addCustomNoise(file)
    setCustomNoises([...customNoises, noise])
    setSelectedNoise(noise.id)
    setShowNoiseUpload(false)
  }

  // 白噪音选择处理
  const handleNoiseSelect = async (noiseId: string) => {
    setSelectedNoise(noiseId)
    if (isMonitoring) {
      try {
        await whiteNoiseService.playNoise(noiseId)
        whiteNoiseService.setVolume(noiseVolume)
      } catch (error) {
        console.error('播放白噪音失败:', error)
        alert('播放白噪音失败，请检查音频文件')
      }
    }
  }

  // 音量调节处理
  const handleVolumeChange = (volume: number) => {
    setNoiseVolume(volume)
    whiteNoiseService.setVolume(volume)
  }

  // 开始睡眠监测
  const startMonitoring = async () => {
    if (!isInitialized) {
      await initializeAudio()
    }

    if (!hasPermission) {
      alert('需要麦克风权限才能使用睡眠监测功能')
      return
    }

    const now = Date.now()
    setSleepStartTime(now)
    setIsMonitoring(true)
    setSleepEvents([])

    // 播放选中的白噪音
    if (selectedNoise) {
      try {
        await whiteNoiseService.playNoise(selectedNoise)
        whiteNoiseService.setVolume(noiseVolume)
      } catch (error) {
        console.error('播放白噪音失败:', error)
      }
    }

    // 开始音频监测
    audioMonitor.startMonitoring((event) => {
      setSleepEvents((prev) => [...prev, event])

      // 震动反馈（iOS）
      if ('vibrate' in navigator && event.type === 'snore') {
        navigator.vibrate(200)
      }
    })

    // 更新睡眠时长
    timerRef.current = window.setInterval(() => {
      setCurrentDuration(Math.round((Date.now() - now) / 1000))
    }, 1000)
  }

  // 停止睡眠监测
  const stopMonitoring = async () => {
    if (!sleepStartTime) return

    setIsMonitoring(false)

    // 清除定时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // 停止白噪音
    whiteNoiseService.stop()

    // 停止音频监测
    const events = await audioMonitor.stopMonitoring()

    // 对梦话事件进行语音识别和音频转换
    const eventsWithTranscripts = await Promise.all(
      events.map(async (event) => {
        if (event.type === 'sleep_talking' && event.audioBlob) {
          try {
            // 将音频 Blob 转换为 Base64
            const reader = new FileReader()
            const base64Promise = new Promise<string>((resolve, reject) => {
              reader.onloadend = () => {
                const result = reader.result as string
                if (result) {
                  const base64 = result.split(',')[1] // 移除 data URL 前缀
                  resolve(base64)
                } else {
                  reject(new Error('Failed to read audio blob'))
                }
              }
              reader.onerror = () => reject(new Error('FileReader error'))
              reader.readAsDataURL(event.audioBlob!)
            })
            const base64Audio = await base64Promise

            return {
              ...event,
              transcript: undefined, // 不显示待识别标记
              audioData: base64Audio, // 保存 Base64 音频数据
              audioUrl: undefined, // 移除 Blob URL，因为无法持久化
            }
          } catch (error) {
            console.error('音频转换失败:', error)
            return event
          }
        }
        return event
      })
    )

    const endTime = Date.now()
    const duration = Math.round((endTime - sleepStartTime) / 1000) // 秒
    const goldenSleepTime = calculateGoldenSleepTime(sleepStartTime, endTime)
    const snoreCount = eventsWithTranscripts.filter((e) => e.type === 'snore').length
    const talkingCount = eventsWithTranscripts.filter((e) => e.type === 'sleep_talking').length

    try {
      // 保存到本地存储
      console.log('💾 保存睡眠监测记录:', { duration, goldenSleepTime, snoreCount, talkingCount, eventCount: eventsWithTranscripts.length })

      await localSleepService.createSleepMonitorRecord({
        duration,
        events: eventsWithTranscripts,
        goldenSleepTime,
        snoreCount,
        talkingCount,
      })
      console.log('✅ 睡眠记录保存成功')
      alert('睡眠记录已保存！')
    } catch (error: any) {
      console.error('❌ 保存失败:', error)
      alert(`保存失败: ${error.message || '未知错误'}`)
    }

    // 回调
    if (onSleepComplete) {
      onSleepComplete({
        duration,
        events: eventsWithTranscripts,
        goldenSleepTime,
        snoreCount,
        talkingCount,
      })
    }

    // 清理
    audioMonitor.cleanup()

    // 重置状态
    setSleepStartTime(null)
    setCurrentDuration(0)
    setSleepEvents([])
  }

  // 格式化时长
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}小时${minutes}分`
    }
    return `${minutes}分${secs}秒`
  }

  // 获取事件图标
  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'snore':
        return '💤'
      case 'sleep_talking':
        return '💬'
      case 'noise':
        return '🔊'
      default:
        return '📝'
    }
  }

  // 获取事件文本
  const getEventText = (event: SleepEventData): string => {
    const time = new Date(event.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })

    switch (event.type) {
      case 'snore':
        return `${time} 打鼾`
      case 'sleep_talking':
        return `${time} 说梦话`
      case 'noise':
        return `${time} 其他噪音`
      default:
        return `${time} 未知`
    }
  }

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      audioMonitor.cleanup()
      whiteNoiseService.cleanup()
    }
  }, [])

  return (
    <div className="space-y-4 pb-24">
      {/* 白噪音控制卡片 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">🎵 白噪音</h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedNoise ? '已选择白噪音' : '选择助眠白噪音'}
            </p>
          </div>
          <button
            onClick={() => setShowWhiteNoise(!showWhiteNoise)}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
          >
            {showWhiteNoise ? '收起' : '展开'}
          </button>
        </div>

        {showWhiteNoise && (
          <div className="mt-4 space-y-4">
            {/* 自定义白噪音 */}
            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">我的白噪音</div>
              {customNoises.length === 0 ? (
                <button
                  onClick={() => setShowNoiseUpload(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-green-400 hover:bg-green-50 transition-colors"
                >
                  <div className="text-2xl mb-1">📁</div>
                  <div className="text-sm text-gray-600">上传白噪音音频</div>
                </button>
              ) : (
                <div className="space-y-2">
                  {customNoises.map((noise) => (
                    <button
                      key={noise.id}
                      onClick={() => handleNoiseSelect(noise.id)}
                      className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                        selectedNoise === noise.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-xl">🎵</span>
                      <span className="flex-1 text-sm">{noise.name}</span>
                      {selectedNoise === noise.id && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowNoiseUpload(true)}
                    className="w-full p-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    + 添加更多
                  </button>
                </div>
              )}
            </div>

            {/* 隐藏的文件输入 */}
            {showNoiseUpload && (
              <input
                type="file"
                accept="audio/*"
                onChange={handleNoiseUpload}
                className="hidden"
                id="noise-upload"
                autoFocus
              />
            )}
            {showNoiseUpload && (
              <label
                htmlFor="noise-upload"
                className="block w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition-colors text-center"
              >
                <div className="text-green-700 font-medium">选择音频文件上传</div>
              </label>
            )}

            {/* 音量控制 */}
            {selectedNoise && (
              <div>
                <div className="text-sm font-bold text-gray-700 mb-2">音量调节</div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">🔈</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={noiseVolume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm">🔊</span>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {Math.round(noiseVolume * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* 提示信息 */}
            {selectedNoise && !isMonitoring && (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">
                ✓ 白噪音已选择，开始监测时自动播放
              </div>
            )}
            {selectedNoise && isMonitoring && (
              <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg">
                🔊 白噪音播放中...
              </div>
            )}
          </div>
        )}
      </div>

      {/* 主控制卡片 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="text-center space-y-4">
          {/* 睡眠时长显示 */}
          <div className="py-8">
            <div className="text-6xl font-bold text-gray-900 tabular-nums">
              {formatDuration(currentDuration)}
            </div>
            <div className="text-gray-500 mt-2">睡眠时长</div>
          </div>

          {/* 状态指示 */}
          {!hasPermission && hasPermission !== null && (
            <div className="ios-card bg-red-50 text-red-600">
              <div className="text-sm">需要麦克风权限</div>
            </div>
          )}

          {/* 开始/停止按钮 */}
          {!isMonitoring ? (
            <button
              onClick={startMonitoring}
              className="ios-btn ios-btn-green w-full text-lg py-4"
            >
              😴 开始睡眠监测
            </button>
          ) : (
            <button
              onClick={stopMonitoring}
              className="ios-btn ios-btn-red w-full text-lg py-4"
            >
              ⏹ 停止监测
            </button>
          )}

          {/* 提示文本 */}
          <p className="text-xs text-gray-500">
            {isMonitoring
              ? '监测中，将检测打鼾和说梦话'
              : '点击开始监测您的睡眠质量'}
          </p>
        </div>
      </div>

      {/* 实时事件统计 */}
      {isMonitoring && sleepEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 animate-slide-up">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 实时统计</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* 打鼾次数 */}
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">
                {sleepEvents.filter((e) => e.type === 'snore').length}
              </div>
              <div className="text-sm text-blue-500 mt-1">打鼾次数</div>
            </div>

            {/* 梦话次数 */}
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">
                {sleepEvents.filter((e) => e.type === 'sleep_talking').length}
              </div>
              <div className="text-sm text-purple-500 mt-1">说梦话</div>
            </div>
          </div>
        </div>
      )}

      {/* 事件列表 */}
      {sleepEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 animate-slide-up">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📝 检测记录</h3>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sleepEvents.slice().reverse().map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-2xl">{getEventIcon(event.type)}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {getEventText(event)}
                  </div>
                  <div className="text-xs text-gray-500">
                    持续 {Math.round(event.duration / 1000)} 秒
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">✨ 功能说明</h3>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-xl">💤</span>
            <div>
              <div className="font-medium text-gray-900">打鼾检测</div>
              <div className="text-xs">自动检测打鼾次数和频率</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div>
              <div className="font-medium text-gray-900">梦话录制</div>
              <div className="text-xs">记录说梦话的时间和内容</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">⭐</span>
            <div>
              <div className="font-medium text-gray-900">黄金睡眠</div>
              <div className="text-xs">统计 22:00-02:00 的睡眠时长</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">📊</span>
            <div>
              <div className="font-medium text-gray-900">睡眠分析</div>
              <div className="text-xs">全面的睡眠质量分析报告</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
