/**
 * 凯格尔训练类型定义
 */

export interface KegelExercise {
  id: number
  date: string // ISO 日期字符串
  level: 'beginner' | 'intermediate' | 'advanced' // 难度等级
  duration: number // 秒
  contractions: number | null // 收缩次数
  notes: string | null // 备注
  created_at: string // 创建时间
  holdTime?: number // 收缩时间（秒）
  relaxTime?: number // 放松时间（秒）
  reps?: number // 重复次数
}

export interface KegelStats {
  totalExercises: number
  totalTime: number // 总训练时长(秒)
  currentStreak: number // 连续登录天数
  longestStreak: number // 最长连续天数
  loginDays: number // 总登录天数
  thisWeekCount: number
  thisMonthCount: number
  averageDuration: number
  level: 'beginner' | 'intermediate' | 'advanced'
}

export interface KegelLevelConfig {
  level: 'beginner' | 'intermediate' | 'advanced'
  name: string
  description: string
  holdTime: number
  relaxTime: number
  reps: number
  recommendedDuration: number
}

export interface KegelTrainingSession {
  id: string
  status: 'idle' | 'running' | 'paused' | 'completed'
  currentRep: number
  totalReps: number
  isHolding: boolean
  timeRemaining: number
  level: KegelLevelConfig
}
