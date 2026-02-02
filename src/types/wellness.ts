/**
 * 身心疗愈模块类型定义
 */

// 睡眠事件数据
export interface SleepEventData {
  type: 'snore' | 'sleep_talking' | 'noise'
  timestamp: number
  duration: number
  audioBlob?: Blob
  audioUrl?: string
  audioData?: string // Base64 编码的音频数据
  transcript?: string // 语音识别文字（仅限梦话）
}

// 睡眠记录
export interface SleepRecord {
  id: number
  userId?: number
  bedTime: string
  wakeTime: string
  duration?: number // 小时
  quality: 1 | 2 | 3 | 4 | 5 // 睡眠质量评分
  mood: string
  notes?: string
  createdAt?: string
  // 睡眠监测数据（可选）
  goldenSleepTime?: number // 黄金睡眠时间（分钟）
  snoreCount?: number // 打鼾次数
  talkingCount?: number // 梦话次数
  events?: SleepEventData[] // 睡眠事件列表
}

// 冥想记录
export interface MeditationSession {
  id: number
  userId: number
  duration: number // 分钟
  type: 'breathing' | 'mindfulness' | 'body-scan' | 'guided'
  completedAt: string
  notes?: string
}

// 身心疗愈统计
export interface WellnessStats {
  sleep: {
    averageDuration: number
    averageQuality: number
    currentStreak: number
  }
  meditation: {
    totalSessions: number
    totalMinutes: number
    currentStreak: number
  }
}

// 冥想类型配置
export interface MeditationType {
  id: string
  name: string
  description: string
  duration: number
  icon: string
}

// 呼吸练习状态
export interface BreathingState {
  phase: 'inhale' | 'hold' | 'exhale' | 'rest'
  timeRemaining: number
  cycle: number
  totalCycles: number
}
