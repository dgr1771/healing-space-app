/**
 * 冥想计时器组件
 * 使用本地存储，无需后端支持
 */

import { useState, useEffect } from 'react'
import { localSleepService } from '@services/localSleepService'
import { soundService } from '@services/soundService'
import { meditationAudioService } from '@services/meditationAudioService'
import { type MeditationSession, type BreathingState } from '../../types/wellness'

export default function MeditationTimer() {
  const [activeTab, setActiveTab] = useState<'meditation' | 'history'>('meditation')
  const [selectedType, setSelectedType] = useState<string>('breathing')
  const [session, setSession] = useState<{ status: 'idle' | 'running' | 'paused' | 'completed'; timeRemaining: number; duration: number } | null>(null)
  const [breathingState, setBreathingState] = useState<BreathingState | null>(null)
  const [history, setHistory] = useState<MeditationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)
  const [showGuideSelector, setShowGuideSelector] = useState(false)

  const meditationTypes = localSleepService.getMeditationTypes()
  const guides = meditationAudioService.getAllGuides()

  // 处理音频文件上传
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      alert('请上传音频文件')
      return
    }

    const guide = meditationAudioService.addCustomGuide(
      file,
      selectedType as any,
      file.name.replace(/\.[^/.]+$/, '')
    )
    setSelectedGuide(guide.id)
  }

  useEffect(() => {
    loadHistory()
    return () => {
      soundService.cleanup()
      meditationAudioService.cleanup()
    }
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await localSleepService.getMeditationSessions({ limit: 30 })
      setHistory(data)
    } catch (error) {
      console.error('加载冥想记录失败:', error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  // 开始冥想
  const startMeditation = async () => {
    const type = meditationTypes.find(t => t.id === selectedType)!

    // 播放引导音频（如果选择了）
    if (selectedGuide) {
      try {
        await meditationAudioService.playGuide(selectedGuide)
      } catch (error) {
        console.error('播放引导音频失败:', error)
        alert('音频播放失败，将仅使用计时器模式')
        setSelectedGuide(null)
      }
    }

    // 播放开始提示音和滴答声（所有类型都播放）
    if (soundEnabled) {
      await soundService.playStart()
      await soundService.startTick(1000)
    }

    setSession({
      status: 'running',
      timeRemaining: type.duration * 60,
      duration: type.duration * 60,
    })

    // 如果是呼吸练习，启动呼吸状态
    if (selectedType === 'breathing') {
      startBreathing()
    }
  }

  // 开始呼吸练习 (4-7-8呼吸法)
  const startBreathing = () => {
    setBreathingState({
      phase: 'inhale',
      timeRemaining: 4,
      cycle: 1,
      totalCycles: 5,
    })
  }

  // 呼吸练习计时器
  useEffect(() => {
    if (!breathingState) return

    const interval = setInterval(() => {
      setBreathingState(prev => {
        if (!prev) return prev

        const newTime = prev.timeRemaining - 1

        if (newTime <= 0) {
          // 切换到下一阶段
          if (prev.phase === 'inhale') {
            if (soundEnabled) soundService.playPhaseChange()
            return { ...prev, phase: 'hold', timeRemaining: 7 }
          } else if (prev.phase === 'hold') {
            if (soundEnabled) soundService.playPhaseChange()
            return { ...prev, phase: 'exhale', timeRemaining: 8 }
          } else if (prev.phase === 'exhale') {
            // 完成一个循环
            if (prev.cycle < prev.totalCycles) {
              if (soundEnabled) soundService.playPhaseChange()
              return { ...prev, phase: 'inhale', timeRemaining: 4, cycle: prev.cycle + 1 }
            } else {
              // 完成所有循环
              if (soundEnabled) soundService.playCompletionAlarm()
              return { ...prev, phase: 'rest', timeRemaining: 5 }
            }
          } else {
            // 休息结束，重新开始
            if (soundEnabled) soundService.playPhaseChange()
            return { ...prev, phase: 'inhale', timeRemaining: 4, cycle: 1 }
          }
        }

        return { ...prev, timeRemaining: newTime }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [breathingState, soundEnabled])

  // 冥想计时器
  useEffect(() => {
    if (!session || session.status !== 'running' || selectedType === 'breathing') return

    const interval = setInterval(() => {
      setSession(prev => {
        if (!prev || prev.status !== 'running') return prev

        const newTime = prev.timeRemaining - 1

        if (newTime <= 0) {
          if (soundEnabled) {
            soundService.stopTick()
            soundService.playCompletionAlarm()
          }
          return { ...prev, status: 'completed', timeRemaining: 0 }
        }

        return { ...prev, timeRemaining: newTime }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.status, session?.timeRemaining, selectedType, soundEnabled])

  // 暂停/继续
  const togglePause = () => {
    if (!session) return

    if (session.status === 'running') {
      soundService.stopTick()
      meditationAudioService.pause()
    } else {
      if (soundEnabled && selectedType !== 'breathing') {
        soundService.startTick(1000)
      }
      meditationAudioService.resume()
    }

    setSession({
      ...session,
      status: session.status === 'running' ? 'paused' : 'running',
    })
  }

  // 完成冥想
  const completeMeditation = async () => {
    if (!session) return

    try {
      await localSleepService.createMeditationSession({
        duration: Math.round((session.duration - session.timeRemaining) / 60),
        type: selectedType as any,
      })

      soundService.cleanup()
      setSession(null)
      setBreathingState(null)
      loadHistory()
    } catch (error) {
      console.error('保存冥想记录失败:', error)
    }
  }

  // 结束冥想
  const endMeditation = () => {
    meditationAudioService.stop()
    soundService.cleanup()
    setSession(null)
    setBreathingState(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const typeName: Record<string, string> = {
    breathing: '呼吸练习',
    mindfulness: '正念冥想',
    'body-scan': '身体扫描',
    guided: '引导冥想',
  }

  return (
    <div className="space-y-6">
      {/* Tab切换 */}
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
        <button
          onClick={() => setActiveTab('meditation')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'meditation'
              ? 'bg-[#007AFF] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🧘 冥想
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-[#007AFF] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📚 记录
        </button>
      </div>

      {/* 冥想界面 */}
      {activeTab === 'meditation' && (
        <>
          {/* 未开始 */}
          {!session && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">选择冥想类型</h3>

              {/* 声音开关 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔔</span>
                    <div>
                      <div className="font-medium text-gray-900">声音提示</div>
                      <div className="text-sm text-gray-500">滴答声和完成提醒</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        soundEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 引导音频选择 */}
                <div
                  onClick={() => setShowGuideSelector(!showGuideSelector)}
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <div className="font-medium text-gray-900">引导音频</div>
                      <div className="text-sm text-gray-500">
                        {selectedGuide
                          ? guides.find(g => g.id === selectedGuide)?.name
                          : '添加冥想大师引导'}
                      </div>
                    </div>
                  </div>
                  <span className="text-2xl">{showGuideSelector ? '▼' : '▶'}</span>
                </div>
              </div>

              {/* 引导音频选择器 */}
              {showGuideSelector && (
                <div className="mb-6 bg-purple-50 rounded-xl p-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">🎧 冥想引导音频</h4>

                  {/* 上传音频 */}
                  <div className="mb-4">
                    <div className="text-sm font-bold text-gray-700 mb-2">📁 上传自定义音频</div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label
                      htmlFor="audio-upload"
                      className="block w-full text-center p-4 bg-white hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-purple-300"
                    >
                      <div className="text-3xl mb-2">📁</div>
                      <div className="font-medium text-purple-700">上传冥想引导音频</div>
                      <div className="text-sm text-gray-500 mt-1">
                        支持 MP3、WAV、OGG 等格式
                      </div>
                    </label>
                  </div>

                  {/* 用户上传的音频列表 */}
                  {guides.filter(g => g.isLocal).length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-bold text-gray-700 mb-2">🎵 我的音频库</div>
                      <div className="space-y-2">
                        {guides.filter(g => g.isLocal).map((guide) => (
                          <div key={guide.id} className="relative">
                            <button
                              onClick={() => setSelectedGuide(guide.id)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                selectedGuide === guide.id
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{guide.name}</span>
                                    <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded">
                                      {guide.type === 'breathing' && '呼吸'}
                                      {guide.type === 'mindfulness' && '正念'}
                                      {guide.type === 'body-scan' && '身体扫描'}
                                      {guide.type === 'sleep' && '助眠'}
                                    </span>
                                  </div>
                                  <div className="text-sm opacity-75">{guide.description}</div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    meditationAudioService.removeCustomGuide(guide.id)
                                    if (selectedGuide === guide.id) {
                                      setSelectedGuide(null)
                                    }
                                  }}
                                  className="ml-2 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                >
                                  删除
                                </button>
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 不使用引导 */}
                  <button
                    onClick={() => setSelectedGuide(null)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedGuide === null
                        ? 'bg-gray-400 text-white'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">❌ 不使用引导音频</div>
                    <div className="text-sm opacity-75">仅使用计时器滴答声</div>
                  </button>

                  <div className="text-xs text-gray-600 bg-blue-100 p-2 rounded">
                    💡 提示：请上传您自己的冥想引导音频，或选择不使用引导音频
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {meditationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedType === type.id
                        ? 'border-[#007AFF] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{type.name}</h4>
                    <p className="text-sm text-gray-600">{type.description}</p>
                    <div className="mt-3 text-sm text-[#007AFF] font-medium">
                      ⏱️ {type.duration} 分钟
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={startMeditation}
                className="w-full py-4 bg-[#007AFF] text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors"
              >
                🚀 开始冥想
              </button>
            </div>
          )}

          {/* 呼吸练习 */}
          {session && selectedType === 'breathing' && breathingState && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center">
                <div className="mb-6">
                  <span className="text-lg text-gray-600">
                    第 {breathingState.cycle} / {breathingState.totalCycles} 轮
                  </span>
                </div>

                {/* 呼吸圆环 */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                  <svg className="w-full h-full">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke={
                        breathingState.phase === 'inhale' ? '#3b82f6' :
                        breathingState.phase === 'hold' ? '#f59e0b' :
                        breathingState.phase === 'exhale' ? '#10b981' :
                        '#8b5cf6'
                      }
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${
                        (breathingState.timeRemaining /
                          (breathingState.phase === 'inhale' ? 4 :
                           breathingState.phase === 'hold' ? 7 :
                           breathingState.phase === 'exhale' ? 8 : 5)
                        ) * 754
                      } 754`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {breathingState.timeRemaining}
                    </div>
                    <div className="text-2xl font-bold">
                      {breathingState.phase === 'inhale' && '🌬️ 吸气'}
                      {breathingState.phase === 'hold' && '✋ 保持'}
                      {breathingState.phase === 'exhale' && '💨 呼气'}
                      {breathingState.phase === 'rest' && '😌 休息'}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  {breathingState.phase === 'inhale' && (
                    <p className="text-lg text-blue-600 font-medium">深深吸气...</p>
                  )}
                  {breathingState.phase === 'hold' && (
                    <p className="text-lg text-yellow-600 font-medium">保持住...</p>
                  )}
                  {breathingState.phase === 'exhale' && (
                    <p className="text-lg text-green-600 font-medium">慢慢呼气...</p>
                  )}
                  {breathingState.phase === 'rest' && (
                    <p className="text-lg text-purple-600 font-medium">放松休息...</p>
                  )}
                </div>

                <button
                  onClick={endMeditation}
                  className="px-8 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  结束
                </button>
              </div>
            </div>
          )}

          {/* 普通冥想计时器 */}
          {session && selectedType !== 'breathing' && session.status !== 'completed' && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center">
                <div className="mb-4">
                  <span className="text-lg text-gray-600">{typeName[selectedType]}</span>
                </div>

                <div className="text-7xl font-bold text-gray-900 mb-8">
                  {formatTime(session.timeRemaining)}
                </div>

                <div className="mb-8">
                  <p className="text-gray-600">
                    {session.status === 'running' ? '🧘 专注于你的呼吸...' : '⏸️ 已暂停'}
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  {session.status === 'running' ? (
                    <button
                      onClick={togglePause}
                      className="px-8 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                    >
                      ⏸️ 暂停
                    </button>
                  ) : (
                    <button
                      onClick={togglePause}
                      className="px-8 py-3 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      ▶️ 继续
                    </button>
                  )}
                  <button
                    onClick={endMeditation}
                    className="px-8 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    结束
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 冥想完成 */}
          {session && session.status === 'completed' && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">冥想完成！</h2>
                <p className="text-gray-600 mb-8">
                  你完成了 {Math.round(session.duration / 60)} 分钟的 {typeName[selectedType]}
                </p>

                <button
                  onClick={completeMeditation}
                  className="px-8 py-3 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  ✅ 保存记录
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 历史记录 */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">冥想记录</h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p>加载中...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="text-4xl mb-4">📝</div>
                <p>还没有冥想记录，开始第一次冥想吧！</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {history.map((record) => (
                <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {record.type === 'breathing' && '🌬️'}
                          {record.type === 'mindfulness' && '🧘'}
                          {record.type === 'body-scan' && '👤'}
                          {record.type === 'guided' && '🎧'}
                        </span>
                        <span className="font-medium text-gray-900">
                          {typeName[record.type]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.completedAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#007AFF]">
                        {record.duration} 分钟
                      </div>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      📝 {record.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  )
}
