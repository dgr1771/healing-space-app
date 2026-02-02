/**
 * 本地存储睡眠记录服务
 * 完全基于 localStorage，无需后端支持
 */

import type { SleepRecord, SleepEventData, MeditationSession, WellnessStats, MeditationType } from '../types/wellness'

// 冥想类型配置
export const MEDITATION_TYPES: MeditationType[] = [
  {
    id: 'breathing',
    name: '呼吸练习',
    description: '深呼吸放松，4-7-8呼吸法',
    duration: 5,
    icon: '🌬️',
  },
  {
    id: 'mindfulness',
    name: '正念冥想',
    description: '专注当下，清空思绪',
    duration: 10,
    icon: '🧘',
  },
  {
    id: 'body-scan',
    name: '身体扫描',
    description: '从头到脚放松身体各部位',
    duration: 15,
    icon: '👤',
  },
  {
    id: 'guided',
    name: '引导冥想',
    description: '跟随引导语进入深度放松',
    duration: 20,
    icon: '🎧',
  },
]

const SLEEP_STORAGE_KEY = 'sleep_records'
const SLEEP_ID_COUNTER_KEY = 'sleep_records_id_counter'
const MEDITATION_STORAGE_KEY = 'meditation_records'
const MEDITATION_ID_COUNTER_KEY = 'meditation_records_id_counter'

class LocalSleepService {
  // ========== 睡眠记录相关 ==========

  // 生成新的 ID
  private generateId(type: 'sleep' | 'meditation'): number {
    const counterKey = type === 'sleep' ? SLEEP_ID_COUNTER_KEY : MEDITATION_ID_COUNTER_KEY
    const counter = localStorage.getItem(counterKey)
    const newId = counter ? parseInt(counter) + 1 : 1
    localStorage.setItem(counterKey, newId.toString())
    return newId
  }

  // 获取所有睡眠记录
  private getStoredRecords(): SleepRecord[] {
    try {
      const data = localStorage.getItem(SLEEP_STORAGE_KEY)
      if (!data) return []

      const records = JSON.parse(data)

      // 处理 events 字段：确保是数组格式
      return records.map((record: any) => ({
        ...record,
        events: typeof record.events === 'string'
          ? JSON.parse(record.events || '[]')
          : record.events || []
      }))
    } catch (error) {
      console.error('读取本地存储失败:', error)
      return []
    }
  }

  // 保存睡眠记录到本地存储
  private saveRecords(records: SleepRecord[]): void {
    try {
      localStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(records))
    } catch (error) {
      console.error('保存到本地存储失败:', error)
      throw new Error('保存失败，存储空间可能不足')
    }
  }

  // 创建睡眠记录
  async createSleepRecord(data: {
    bedTime: string
    wakeTime: string
    quality: 1 | 2 | 3 | 4 | 5
    mood: string
    notes?: string
  }): Promise<SleepRecord> {
    const records = this.getStoredRecords()
    const newRecord: SleepRecord = {
      id: this.generateId('sleep'),
      bedTime: data.bedTime,
      wakeTime: data.wakeTime,
      quality: data.quality,
      mood: data.mood,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      events: []
    }

    records.unshift(newRecord) // 新记录排在前面
    this.saveRecords(records)

    return newRecord
  }

  // 创建睡眠监测记录（包含音频事件）
  async createSleepMonitorRecord(data: {
    duration: number
    events: SleepEventData[]
    goldenSleepTime: number
    snoreCount: number
    talkingCount: number
  }): Promise<SleepRecord> {
    const records = this.getStoredRecords()
    const now = new Date()
    const bedTime = new Date(now.getTime() - data.duration * 60 * 1000)

    const newRecord: SleepRecord = {
      id: this.generateId('sleep'),
      bedTime: bedTime.toISOString(),
      wakeTime: now.toISOString(),
      quality: 4, // 默认质量
      mood: '自动记录',
      createdAt: now.toISOString(),
      goldenSleepTime: data.goldenSleepTime,
      snoreCount: data.snoreCount,
      talkingCount: data.talkingCount,
      events: data.events
    }

    records.unshift(newRecord)
    this.saveRecords(records)

    return newRecord
  }

  // 获取睡眠记录列表
  async getSleepRecords(params?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }): Promise<SleepRecord[]> {
    let records = this.getStoredRecords()

    // 日期过滤
    if (params?.startDate || params?.endDate) {
      records = records.filter(record => {
        const recordDate = new Date(record.bedTime)
        if (params.startDate && recordDate < new Date(params.startDate)) return false
        if (params.endDate && recordDate > new Date(params.endDate)) return false
        return true
      })
    }

    // 分页
    if (params?.offset) {
      records = records.slice(params.offset)
    }
    if (params?.limit) {
      records = records.slice(0, params.limit)
    }

    return records
  }

  // 删除睡眠记录
  async deleteSleepRecord(id: number): Promise<void> {
    const records = this.getStoredRecords()
    const filtered = records.filter(r => r.id !== id)
    this.saveRecords(filtered)
  }

  // 更新睡眠记录
  async updateSleepRecord(id: number, updates: Partial<SleepRecord>): Promise<SleepRecord | null> {
    const records = this.getStoredRecords()
    const index = records.findIndex(r => r.id === id)

    if (index === -1) return null

    records[index] = { ...records[index], ...updates }
    this.saveRecords(records)

    return records[index]
  }

  // 识别睡眠记录中的梦话（本地版本：仅返回消息）
  async transcribeSleepRecord(_id: number): Promise<{
    success: boolean
    message: string
    events: any[]
  }> {
    // 本地版本不支持实际的语音识别
    return {
      success: false,
      message: '本地存储版本暂不支持语音识别功能',
      events: []
    }
  }

  // ========== 冥想记录相关 ==========

  // 获取所有冥想记录
  private getStoredMeditationRecords(): MeditationSession[] {
    try {
      const data = localStorage.getItem(MEDITATION_STORAGE_KEY)
      if (!data) return []
      return JSON.parse(data)
    } catch (error) {
      console.error('读取冥想记录失败:', error)
      return []
    }
  }

  // 保存冥想记录到本地存储
  private saveMeditationRecords(records: MeditationSession[]): void {
    try {
      localStorage.setItem(MEDITATION_STORAGE_KEY, JSON.stringify(records))
    } catch (error) {
      console.error('保存冥想记录失败:', error)
      throw new Error('保存失败，存储空间可能不足')
    }
  }

  // 创建冥想记录
  async createMeditationSession(data: {
    duration: number
    type: 'breathing' | 'mindfulness' | 'body-scan' | 'guided'
    notes?: string
  }): Promise<MeditationSession> {
    const records = this.getStoredMeditationRecords()
    const newRecord: MeditationSession = {
      id: this.generateId('meditation'),
      userId: 1, // 本地版本固定为1
      duration: data.duration,
      type: data.type,
      completedAt: new Date().toISOString(),
      notes: data.notes
    }

    records.unshift(newRecord)
    this.saveMeditationRecords(records)

    return newRecord
  }

  // 获取冥想记录列表
  async getMeditationSessions(params?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }): Promise<MeditationSession[]> {
    let records = this.getStoredMeditationRecords()

    // 日期过滤
    if (params?.startDate || params?.endDate) {
      records = records.filter(record => {
        const recordDate = new Date(record.completedAt)
        if (params.startDate && recordDate < new Date(params.startDate)) return false
        if (params.endDate && recordDate > new Date(params.endDate)) return false
        return true
      })
    }

    // 分页
    if (params?.offset) {
      records = records.slice(params.offset)
    }
    if (params?.limit) {
      records = records.slice(0, params.limit)
    }

    return records
  }

  // ========== 统计数据 ==========

  async getStats(): Promise<WellnessStats> {
    const sleepRecords = this.getStoredRecords()
    const meditationRecords = this.getStoredMeditationRecords()

    // 计算睡眠统计
    let sleepStats = {
      averageDuration: 0,
      averageQuality: 0,
      currentStreak: 0
    }

    if (sleepRecords.length > 0) {
      // 计算平均时长
      let totalDuration = 0
      sleepRecords.forEach(record => {
        const bed = new Date(record.bedTime)
        const wake = new Date(record.wakeTime)
        const duration = (wake.getTime() - bed.getTime()) / 1000 / 60 / 60
        totalDuration += duration > 0 ? duration : duration + 24
      })
      sleepStats.averageDuration = totalDuration / sleepRecords.length

      // 计算平均质量
      const totalQuality = sleepRecords.reduce((sum, r) => sum + r.quality, 0)
      sleepStats.averageQuality = totalQuality / sleepRecords.length

      // 计算连续记录天数
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < sleepRecords.length; i++) {
        const recordDate = new Date(sleepRecords[i].bedTime)
        recordDate.setHours(0, 0, 0, 0)

        const expectedDate = new Date(today)
        expectedDate.setDate(expectedDate.getDate() - i)

        if (recordDate.getTime() === expectedDate.getTime()) {
          sleepStats.currentStreak++
        } else {
          break
        }
      }
    }

    // 计算冥想统计
    let meditationStats = {
      totalSessions: meditationRecords.length,
      totalMinutes: meditationRecords.reduce((sum, r) => sum + r.duration, 0),
      currentStreak: 0
    }

    // 计算冥想连续练习天数
    if (meditationRecords.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < meditationRecords.length; i++) {
        const recordDate = new Date(meditationRecords[i].completedAt)
        recordDate.setHours(0, 0, 0, 0)

        const expectedDate = new Date(today)
        expectedDate.setDate(expectedDate.getDate() - i)

        if (recordDate.getTime() === expectedDate.getTime()) {
          meditationStats.currentStreak++
        } else {
          break
        }
      }
    }

    return {
      sleep: {
        averageDuration: Math.round(sleepStats.averageDuration * 10) / 10,
        averageQuality: Math.round(sleepStats.averageQuality * 10) / 10,
        currentStreak: sleepStats.currentStreak
      },
      meditation: meditationStats
    }
  }

  // 获取冥想类型列表
  getMeditationTypes(): MeditationType[] {
    return MEDITATION_TYPES
  }
}

export const localSleepService = new LocalSleepService()
