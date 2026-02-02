/**
 * 凯格尔训练评估系统
 * 通过问卷评估用户状况，推荐合适的训练等级和计划
 */

import { useState } from 'react'

interface AssessmentResult {
  recommendedLevel: 'beginner' | 'intermediate' | 'advanced'
  dailyFrequency: string
  duration: string
  expectedResults: string[]
  tips: string[]
  score: number
  condition: 'excellent' | 'good' | 'fair' | 'needs_improvement'
}

interface KegelAssessmentProps {
  onComplete: (result: AssessmentResult) => void
  onCancel: () => void
}

export default function KegelAssessment({ onComplete, onCancel }: KegelAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({})
  const [isCalculating, setIsCalculating] = useState(false)

  const questions = [
    {
      id: 'gender',
      title: '您的性别',
      description: '这帮助我们提供更精准的建议',
      type: 'single',
      options: [
        { value: 'male', label: '男性', icon: '👨' },
        { value: 'female', label: '女性', icon: '👩' },
      ],
    },
    {
      id: 'age',
      title: '您的年龄段',
      description: '年龄会影响盆底肌状况',
      type: 'single',
      options: [
        { value: '18-30', label: '18-30岁', icon: '🎯' },
        { value: '31-40', label: '31-40岁', icon: '💼' },
        { value: '41-50', label: '41-50岁', icon: '🏠' },
        { value: '50+', label: '50岁以上', icon: '👴' },
      ],
    },
    {
      id: 'symptoms',
      title: '您是否有以下症状？',
      description: '可多选',
      type: 'multiple',
      options: [
        { value: 'leak', label: '尿失禁/漏尿', icon: '💧' },
        { value: 'urge', label: '尿频/尿急', icon: '🚽' },
        { value: 'prostate', label: '前列腺问题（男性）', icon: '🏥' },
        { value: 'postpartum', label: '产后恢复（女性）', icon: '🤱' },
        { value: 'sexual', label: '性功能问题', icon: '❤️' },
        { value: 'none', label: '无明显症状', icon: '✅' },
      ],
    },
    {
      id: 'experience',
      title: '您之前的凯格尔训练经验',
      description: '选择最符合您情况的一项',
      type: 'single',
      options: [
        { value: 'none', label: '从未进行过', icon: '🆕' },
        { value: 'tried', label: '尝试过几次', icon: '🔄' },
        { value: 'regular', label: '偶尔练习', icon: '📅' },
        { value: 'consistent', label: '坚持练习1个月以上', icon: '💪' },
      ],
    },
    {
      id: 'fitness',
      title: '您的整体运动习惯',
      description: '这会影响肌肉基础状况',
      type: 'single',
      options: [
        { value: 'sedentary', label: '很少运动', icon: '🛋️' },
        { value: 'light', label: '偶尔运动', icon: '🚶' },
        { value: 'moderate', label: '每周运动2-3次', icon: '🏃' },
        { value: 'active', label: '每周运动4次以上', icon: '🏋️' },
      ],
    },
    {
      id: 'self_assessment',
      title: '您对自己盆底肌力量的评估',
      description: '根据憋尿时肌肉力量自我评估',
      type: 'single',
      options: [
        { value: 'very_weak', label: '很弱，很难憋住', icon: '😰' },
        { value: 'weak', label: '较弱，能憋住但不持久', icon: '😕' },
        { value: 'normal', label: '一般，能正常控制', icon: '😐' },
        { value: 'strong', label: '较强，控制良好', icon: '😊' },
        { value: 'very_strong', label: '很强，完全自控', icon: '💪' },
      ],
    },
  ]

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      calculateResult()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSelect = (questionId: string, value: string | string[]) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const calculateResult = () => {
    setIsCalculating(true)

    // 模拟计算过程
    setTimeout(() => {
      const result = generateAssessmentResult(answers)
      setIsCalculating(false)
      onComplete(result)
    }, 1500)
  }

  const generateAssessmentResult = (answers: Record<string, string | number | string[]>): AssessmentResult => {
    let score = 50 // 基础分

    // 年龄影响
    const age = answers.age as string
    if (age === '18-30') score += 10
    else if (age === '31-40') score += 5
    else if (age === '41-50') score -= 5
    else if (age === '50+') score -= 10

    // 症状影响
    const symptoms = (answers.symptoms as string[]) || []
    if (symptoms.includes('none')) score += 15
    else if (symptoms.includes('leak')) score -= 15
    else if (symptoms.includes('urge')) score -= 10
    else if (symptoms.includes('prostate')) score -= 10
    else if (symptoms.includes('postpartum')) score -= 5
    else if (symptoms.includes('sexual')) score -= 5

    // 经验影响
    const experience = answers.experience as string
    if (experience === 'none') score += 0
    else if (experience === 'tried') score += 5
    else if (experience === 'regular') score += 10
    else if (experience === 'consistent') score += 20

    // 运动习惯影响
    const fitness = answers.fitness as string
    if (fitness === 'sedentary') score -= 5
    else if (fitness === 'light') score += 0
    else if (fitness === 'moderate') score += 5
    else if (fitness === 'active') score += 10

    // 自评影响
    const selfAssessment = answers.self_assessment as string
    if (selfAssessment === 'very_weak') score -= 20
    else if (selfAssessment === 'weak') score -= 10
    else if (selfAssessment === 'normal') score += 5
    else if (selfAssessment === 'strong') score += 15
    else if (selfAssessment === 'very_strong') score += 25

    // 限制分数范围
    score = Math.max(0, Math.min(100, score))

    // 根据分数确定等级和状态
    let recommendedLevel: 'beginner' | 'intermediate' | 'advanced'
    let condition: 'excellent' | 'good' | 'fair' | 'needs_improvement'
    let dailyFrequency: string
    let duration: string
    let expectedResults: string[]
    let tips: string[]

    if (score >= 80) {
      condition = 'excellent'
      recommendedLevel = 'advanced'
      dailyFrequency = '每天4-5组'
      duration = '每天约25-30分钟'
      expectedResults = [
        '保持现有盆底肌力量',
        '进一步增强肌肉控制力',
        '维持长期健康状态',
        '预防年龄相关的功能下降',
      ]
      tips = [
        '您的基础很好，继续保持高级训练',
        '可以尝试更长时间的收缩',
        '建议定期评估，维持效果',
        '注意平衡训练，不要过度',
      ]
    } else if (score >= 60) {
      condition = 'good'
      recommendedLevel = 'intermediate'
      dailyFrequency = '每天3-4组'
      duration = '每天约15-20分钟'
      expectedResults = [
        '2-4周内感到力量增强',
        '尿控能力明显改善',
        '性功能逐渐提升',
        '整体生活质量提高',
      ]
      tips = [
        '您有一定基础，中级训练很适合',
        '坚持是关键，建议固定训练时间',
        '记录训练进度和感受',
        '每周评估一次，考虑进阶',
      ]
    } else if (score >= 40) {
      condition = 'fair'
      recommendedLevel = 'beginner'
      dailyFrequency = '每天3组'
      duration = '每天约10-15分钟'
      expectedResults = [
        '2-3周内开始改善症状',
        '4-6周后尿失禁明显减少',
        '8-12周达到基本稳定',
        '6个月后获得长期改善',
      ]
      tips = [
        '从初级开始，建立正确的基础',
        '重点学习正确收缩技巧',
        '不要急于求成，质量比数量重要',
        '建议睡前训练，养成习惯',
      ]
    } else {
      condition = 'needs_improvement'
      recommendedLevel = 'beginner'
      dailyFrequency = '每天3-4组'
      duration = '每天约10-15分钟'
      expectedResults = [
        '第1-2周：学习正确收缩方法',
        '第3-4周：开始感到肌肉控制',
        '第6-8周：症状明显改善',
        '第12周：获得显著改善',
      ]
      tips = [
        '建议先咨询医生或物理治疗师',
        '重点学习如何找到盆底肌',
        '从最短的收缩时间开始（2-3秒）',
        '配合日常活动练习（等车、看电视时）',
        '记录每日练习和症状变化',
        '如有疼痛立即停止并就医',
      ]
    }

    return {
      recommendedLevel,
      dailyFrequency,
      duration,
      expectedResults,
      tips,
      score,
      condition,
    }
  }

  const currentQuestion = questions[currentStep]

  if (isCalculating) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#007AFF] border-t-transparent animate-spin"></div>
            <h3 className="text-xl font-bold text-gray-900">正在分析您的状况...</h3>
            <p className="text-sm text-gray-600 mt-2">基于专业医学指南</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-gray-900">训练评估</h2>
            <div className="w-6"></div>
          </div>

          {/* 进度条 */}
          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index < currentStep
                    ? 'bg-[#007AFF]'
                    : index === currentStep
                    ? 'bg-[#007AFF]'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            问题 {currentStep + 1} / {questions.length}
          </div>
        </div>

        {/* 问题内容 */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQuestion.title}
            </h3>
            <p className="text-gray-600">{currentQuestion.description}</p>
          </div>

          {currentQuestion.type === 'single' ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(currentQuestion.id, option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-[#007AFF] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <span className="text-lg font-medium text-gray-900">{option.label}</span>
                    {answers[currentQuestion.id] === option.value && (
                      <span className="ml-auto text-[#007AFF] text-2xl">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const selectedValues = (answers[currentQuestion.id] as string[]) || []
                const isSelected = selectedValues.includes(option.value)

                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (option.value === 'none') {
                        handleSelect(currentQuestion.id, ['none'])
                      } else {
                        const newValues = isSelected
                          ? selectedValues.filter((v: string) => v !== option.value)
                          : [...selectedValues.filter((v: string) => v !== 'none'), option.value]
                        handleSelect(currentQuestion.id, newValues)
                      }
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#007AFF] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{option.icon}</span>
                      <span className="text-lg font-medium text-gray-900">{option.label}</span>
                      {isSelected && (
                        <span className="ml-auto text-[#007AFF] text-2xl">✓</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                上一题
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                (currentQuestion.type === 'single' && !answers[currentQuestion.id]) ||
                (currentQuestion.type === 'multiple' &&
                  (!answers[currentQuestion.id] || (answers[currentQuestion.id] as string[]).length === 0))
              }
              className="flex-1 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === questions.length - 1 ? '查看结果' : '下一题'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
