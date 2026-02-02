/**
 * 凯格尔训练评估结果展示组件
 * 显示评估结果、推荐计划和预期效果
 */

import { useState } from 'react'

interface AssessmentResultDisplayProps {
  result: {
    recommendedLevel: 'beginner' | 'intermediate' | 'advanced'
    dailyFrequency: string
    duration: string
    expectedResults: string[]
    tips: string[]
    score: number
    condition: 'excellent' | 'good' | 'fair' | 'needs_improvement'
  }
  onStartTraining: (level: 'beginner' | 'intermediate' | 'advanced') => void
  onClose: () => void
}

export default function AssessmentResultDisplay({
  result,
  onStartTraining,
  onClose,
}: AssessmentResultDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)

  const conditionInfo = {
    excellent: {
      label: '优秀',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      emoji: '🌟',
      description: '您的盆底肌状况非常好！',
    },
    good: {
      label: '良好',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      emoji: '👍',
      description: '您的盆底肌状况良好',
    },
    fair: {
      label: '一般',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      emoji: '📈',
      description: '有提升空间，建议开始训练',
    },
    needs_improvement: {
      label: '需改善',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      emoji: '💪',
      description: '建议从初级训练开始，逐步改善',
    },
  }

  const levelInfo = {
    beginner: { name: '初级', emoji: '🌱', color: 'text-green-600' },
    intermediate: { name: '中级', emoji: '💪', color: 'text-blue-600' },
    advanced: { name: '高级', emoji: '🔥', color: 'text-red-600' },
  }

  const currentCondition = conditionInfo[result.condition]
  const recommendedLevel = levelInfo[result.recommendedLevel]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">评估结果</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* 总体评分 */}
          <div className={`${currentCondition.bgColor} rounded-2xl p-6 mb-6`}>
            <div className="text-center">
              <div className="text-5xl mb-3">{currentCondition.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentCondition.description}</h3>
              <div className={`text-lg font-bold ${currentCondition.color} mb-4`}>
                {currentCondition.label}
              </div>

              {/* 分数展示 */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-5xl font-bold text-gray-900">{result.score}</div>
                <div className="text-left text-sm text-gray-600">
                  <div>盆底肌健康评分</div>
                  <div className="text-xs">满分100分</div>
                </div>
              </div>
            </div>
          </div>

          {/* 推荐训练计划 */}
          <div className="ios-card mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 推荐训练计划</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="text-sm text-gray-600">推荐等级</div>
                    <div className={`text-lg font-bold ${recommendedLevel.color}`}>
                      {recommendedLevel.emoji} {recommendedLevel.name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="text-sm text-gray-600">训练频率</div>
                    <div className="text-lg font-bold text-gray-900">{result.dailyFrequency}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <div className="text-sm text-gray-600">每次时长</div>
                    <div className="text-lg font-bold text-gray-900">{result.duration}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 预期效果 */}
          <div className="ios-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📈 预期改善时间线</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-[#007AFF]"
              >
                {showDetails ? '收起' : '展开'}
              </button>
            </div>

            {showDetails ? (
              <div className="space-y-3">
                {result.expectedResults.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="text-sm text-gray-700">{item}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  {result.expectedResults[0]}
                </p>
              </div>
            )}
          </div>

          {/* 个性化建议 */}
          <div className="ios-card mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💡 个性化建议</h3>

            <div className="space-y-3">
              {result.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-[#007AFF] text-lg">•</span>
                  <span className="text-sm text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 重要提示 */}
          <div className="bg-yellow-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="text-sm text-yellow-800">
                <div className="font-bold mb-1">重要提示</div>
                <ul className="space-y-1 list-disc list-inside">
                  <li>评估结果仅供参考，不能替代专业医疗诊断</li>
                  <li>如有严重症状，建议咨询医生或物理治疗师</li>
                  <li>训练过程中如感到疼痛应立即停止</li>
                  <li>坚持比强度更重要，建议养成每日习惯</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 开始训练按钮 */}
          <button
            onClick={() => onStartTraining(result.recommendedLevel)}
            className="w-full py-4 bg-[#007AFF] text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors"
          >
            🚀 开始 {recommendedLevel.name} 训练
          </button>
        </div>
      </div>
    </div>
  )
}
