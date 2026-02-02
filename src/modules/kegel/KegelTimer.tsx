/**
 * 凯格尔训练计时器组件
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { kegelService } from '@services/kegelService'
import { soundService } from '@services/soundService'
import KegelGuide from '../../components/kegel/KegelGuide'
import KegelAssessment from '../../components/kegel/KegelAssessment'
import AssessmentResultDisplay from '../../components/kegel/AssessmentResult'
import { type KegelTrainingSession } from '../../types/kegel'

interface Props {
  session: KegelTrainingSession | null
  setSession: React.Dispatch<React.SetStateAction<KegelTrainingSession | null>>
}

export default function KegelTimer({ session, setSession }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [timer, setTimer] = useState(0)
  const [phase, setPhase] = useState<'hold' | 'relax'>('hold')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showGuide, setShowGuide] = useState(false)
  const [showAssessment, setShowAssessment] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState<any>(null)
  const [mediaFile, setMediaFile] = useState<{ url: string; type: 'image' | 'video'; name: string } | null>(null)
  const [showMediaUploader, setShowMediaUploader] = useState(false)
  const previousPhaseRef = useRef<'hold' | 'relax' | null>(null)
  const previousStatusRef = useRef<string | null>(null)

  // 处理媒体文件上传
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    const fileType = file.type.startsWith('video') ? 'video' : 'image'

    // 创建本地URL
    const url = URL.createObjectURL(file)

    setMediaFile({
      url,
      type: fileType,
      name: file.name
    })
    setShowMediaUploader(false)
  }

  // 移除媒体文件
  const handleRemoveMedia = () => {
    if (mediaFile) {
      URL.revokeObjectURL(mediaFile.url)
    }
    setMediaFile(null)
  }

  // 初始化训练会话
  const startTraining = useCallback(async () => {
    const levelConfig = kegelService.getLevelConfig(selectedLevel)

    if (soundEnabled) {
      await soundService.playStart()
      await soundService.startTick(1000)
    }

    setSession({
      id: Date.now().toString(),
      status: 'running',
      currentRep: 1,
      totalReps: levelConfig.reps,
      isHolding: true,
      timeRemaining: levelConfig.holdTime,
      level: levelConfig,
    })
  }, [selectedLevel, setSession, soundEnabled])

  // 暂停训练
  const pauseTraining = useCallback(() => {
    if (session) {
      if (soundEnabled) {
        soundService.stopTick()
      }
      setSession({ ...session, status: 'paused' })
    }
  }, [session, setSession, soundEnabled])

  // 继续训练
  const resumeTraining = useCallback(async () => {
    if (session) {
      if (soundEnabled) {
        await soundService.playStart()
        await soundService.startTick(1000)
      }
      setSession({ ...session, status: 'running' })
    }
  }, [session, setSession, soundEnabled])

  // 完成训练
  const completeTraining = useCallback(async () => {
    if (session) {
      try {
        await kegelService.completeExercise({
          duration: session.level.reps * (session.level.holdTime + session.level.relaxTime),
          holdTime: session.level.holdTime,
          relaxTime: session.level.relaxTime,
          reps: session.level.reps,
          level: session.level.level,
        })
        soundService.cleanup()
        setSession(null)
      } catch (error) {
        console.error('保存训练记录失败:', error)
      }
    }
  }, [session, setSession])

  // 结束训练（不保存）
  const endTraining = useCallback(() => {
    soundService.cleanup()
    setSession(null)
  }, [setSession])

  // 计时器逻辑
  useEffect(() => {
    if (!session || session.status !== 'running') return

    const interval = setInterval(() => {
      setSession((prev) => {
        if (!prev || prev.status !== 'running') return prev

        const newTime = prev.timeRemaining - 1

        // 时间到了，切换阶段
        if (newTime <= 0) {
          if (prev.isHolding) {
            // 收缩结束，进入放松阶段
            if (soundEnabled) {
              soundService.playPhaseChange()
            }
            return {
              ...prev,
              isHolding: false,
              timeRemaining: prev.level.relaxTime,
            }
          } else {
            // 放松结束，进入下一组
            if (prev.currentRep < prev.totalReps) {
              if (soundEnabled) {
                soundService.playPhaseChange()
              }
              return {
                ...prev,
                isHolding: true,
                currentRep: prev.currentRep + 1,
                timeRemaining: prev.level.holdTime,
              }
            } else {
              // 全部完成
              if (soundEnabled) {
                soundService.stopTick()
                soundService.playCompletionAlarm()
              }
              return {
                ...prev,
                status: 'completed',
              }
            }
          }
        }

        return {
          ...prev,
      timeRemaining: newTime,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.status, session?.timeRemaining, session?.isHolding, session?.currentRep, soundEnabled])

  // 监听训练完成状态变化
  useEffect(() => {
    if (session && previousStatusRef.current === 'running' && session.status === 'completed') {
      // 训练刚完成
    }
    previousStatusRef.current = session?.status || null
  }, [session?.status])

  // 监听阶段变化，播放提示音
  useEffect(() => {
    if (session && session.status === 'running') {
      const currentPhase = session.isHolding ? 'hold' : 'relax'
      if (previousPhaseRef.current && previousPhaseRef.current !== currentPhase) {
        // 阶段切换了
        if (soundEnabled) {
          soundService.playPhaseChange()
        }
      }
      previousPhaseRef.current = currentPhase
    }
  }, [session?.isHolding, session?.status, soundEnabled])

  // 更新当前阶段显示
  useEffect(() => {
    if (session) {
      setPhase(session.isHolding ? 'hold' : 'relax')
      setTimer(session.timeRemaining)
    }
  }, [session?.isHolding, session?.timeRemaining])

  // 清理
  useEffect(() => {
    return () => {
      soundService.cleanup()
    }
  }, [])

  // 难度选择
  const levelConfigs = kegelService.getAllLevelConfigs()

  // 处理评估完成
  const handleAssessmentComplete = (result: any) => {
    setAssessmentResult(result)
    setSelectedLevel(result.recommendedLevel)
    setShowAssessment(false)
  }

  // 从评估结果开始训练
  const handleStartFromAssessment = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setSelectedLevel(level)
    setAssessmentResult(null)
    startTraining()
  }

  return (
    <div className="space-y-6">
      {/* 未开始训练 */}
      {!session && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">选择训练难度</h2>

          {/* 评估入口 */}
          <div
            className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setShowAssessment(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold mb-2">📊 不确定从哪个等级开始？</div>
                <div className="text-sm opacity-90">
                  完成6道简单题目，获取个性化训练计划
                </div>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </div>

          {/* 声音开关、指导按钮和媒体上传 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <div className="font-medium text-gray-900">声音提示</div>
                  <div className="text-xs text-gray-500">滴答声和提醒</div>
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

            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl">📖</span>
              <div className="text-left">
                <div className="font-medium text-gray-900">训练指导</div>
                <div className="text-xs text-gray-500">查看等级说明</div>
              </div>
            </button>

            <div className="relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <span className="text-2xl">🎬</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900">媒体文件</div>
                  <div className="text-xs text-gray-500">
                    {mediaFile ? `${mediaFile.name}` : '添加视频/图片'}
                  </div>
                </div>
              </label>
              {mediaFile && (
                <button
                  onClick={handleRemoveMedia}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* 媒体预览 */}
          {mediaFile && !session && (
            <div className="mb-6 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {mediaFile.type === 'video' ? '🎥 视频' : '🖼️ 图片'}预览
                </span>
                <button
                  onClick={handleRemoveMedia}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  移除
                </button>
              </div>
              <div className="rounded-lg overflow-hidden bg-black">
                {mediaFile.type === 'video' ? (
                  <video
                    src={mediaFile.url}
                    controls
                    className="w-full max-h-64 object-contain"
                  />
                ) : (
                  <img
                    src={mediaFile.url}
                    alt="训练媒体"
                    className="w-full max-h-64 object-contain"
                  />
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {levelConfigs.map((config) => (
              <button
                key={config.level}
                onClick={() => setSelectedLevel(config.level)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedLevel === config.level
                    ? 'border-[#007AFF] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-3">
                  {config.level === 'beginner' && '🌱'}
                  {config.level === 'intermediate' && '💪'}
                  {config.level === 'advanced' && '🔥'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{config.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">收缩时长:</span>
                    <span className="font-medium">{config.holdTime}秒</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">放松时长:</span>
                    <span className="font-medium">{config.relaxTime}秒</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">重复次数:</span>
                    <span className="font-medium">{config.reps}次</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={startTraining}
            className="w-full py-4 bg-[#007AFF] text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors"
          >
            🚀 开始训练
          </button>
        </div>
      )}

      {/* 训练中 */}
      {session && session.status === 'running' && (
        <div className="space-y-6">
          {/* 媒体播放器 */}
          {mediaFile && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-black">
                {mediaFile.type === 'video' ? (
                  <video
                    src={mediaFile.url}
                    autoPlay
                    loop
                    playsInline
                    className="w-full max-h-96 object-contain mx-auto"
                  />
                ) : (
                  <img
                    src={mediaFile.url}
                    alt="训练媒体"
                    className="w-full max-h-96 object-contain mx-auto"
                  />
                )}
              </div>
            </div>
          )}

          {/* 计时器界面 */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center">
              <div className="mb-6">
                <span className="text-lg text-gray-600">
                  第 {session.currentRep} / {session.totalReps} 组
                </span>
              </div>

              {/* 计时器圆环 */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
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
                    stroke={phase === 'hold' ? '#ef4444' : '#10b981'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(timer / (phase === 'hold' ? session.level.holdTime : session.level.relaxTime)) * 754} 754`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold text-gray-900 mb-2">{timer}</div>
                  <div className={`text-2xl font-bold ${
                    phase === 'hold' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {phase === 'hold' ? '⬆️ 收缩' : '⬇️ 放松'}
                  </div>
                </div>
              </div>

              {/* 提示 */}
              <div className="mb-8">
                {phase === 'hold' ? (
                  <p className="text-lg text-red-600 font-medium">
                    收缩盆底肌，保持住...
                  </p>
                ) : (
                  <p className="text-lg text-green-600 font-medium">
                    放松肌肉，休息一下...
                  </p>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={pauseTraining}
                  className="px-8 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                >
                  ⏸️ 暂停
                </button>
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  className="px-8 py-3 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  📖 指导
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 暂停状态 */}
      {session && session.status === 'paused' && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">⏸️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">训练已暂停</h2>

            <div className="flex justify-center gap-4">
              <button
                onClick={resumeTraining}
                className="px-8 py-3 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                ▶️ 继续
              </button>
              <button
                onClick={endTraining}
                className="px-8 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                ❌ 结束
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 训练完成 */}
      {session && session.status === 'completed' && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">训练完成！</h2>
            <p className="text-gray-600 mb-8">
              恭喜你完成了 {session.level.name} 训练，共 {session.totalReps} 组
            </p>

            <button
              onClick={completeTraining}
              className="px-8 py-3 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              ✅ 保存并返回
            </button>
          </div>
        </div>
      )}

      {/* 可视化指导 */}
      <KegelGuide
        isHolding={session ? phase === 'hold' : false}
        timeRemaining={timer}
        level={selectedLevel}
        showGuide={showGuide}
        onToggleGuide={() => setShowGuide(!showGuide)}
        isTraining={!!session}
      />

      {/* 评估问卷 */}
      {showAssessment && !assessmentResult && (
        <KegelAssessment
          onComplete={handleAssessmentComplete}
          onCancel={() => setShowAssessment(false)}
        />
      )}

      {/* 评估结果 */}
      {assessmentResult && (
        <AssessmentResultDisplay
          result={assessmentResult}
          onStartTraining={handleStartFromAssessment}
          onClose={() => setAssessmentResult(null)}
        />
      )}
    </div>
  )
}
