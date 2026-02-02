/**
 * 身心疗愈模块API服务
 */

import apiClient from './apiClient'
import {
  type SleepRecord,
  type MeditationSession,
  type WellnessStats,
  type MeditationType,
} from '../types/wellness'
import type { SleepEventData } from './audioService'

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

class WellnessService {
  private sleepUrl = '/api/v1/wellness/sleep'
  private meditationUrl = '/api/v1/wellness/meditation'

  // ========== 睡眠相关 ==========
  async createSleepRecord(data: {
    bedTime: string
    wakeTime: string
    quality: 1 | 2 | 3 | 4 | 5
    mood: string
    notes?: string
  }): Promise<SleepRecord> {
    const response = await apiClient.post<SleepRecord>(this.sleepUrl, data)
    return response.data
  }

  // 创建睡眠监测记录（包含音频事件）
  async createSleepMonitorRecord(data: {
    duration: number
    events: SleepEventData[]
    goldenSleepTime: number
    snoreCount: number
    talkingCount: number
  }): Promise<SleepRecord> {
    const response = await apiClient.post<SleepRecord>(`${this.sleepUrl}/monitor`, data)
    return response.data
  }

  async getSleepRecords(params?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }): Promise<SleepRecord[]> {
    const response = await apiClient.get<SleepRecord[]>(this.sleepUrl, { params })
    return response.data
  }

  // ========== 语音识别相关 ==========

  // 获取ASR服务状态
  async getASRStatus(): Promise<{ isReady: boolean; modelName: string }> {
    const response = await apiClient.get('/api/v1/wellness/asr/status')
    return response.data
  }

  // 初始化ASR模型
  async initializeASR(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/api/v1/wellness/asr/initialize', {})
    return response.data
  }

  // 识别睡眠记录中的梦话
  async transcribeSleepRecord(id: number): Promise<{
    success: boolean
    message: string
    events: any[]
  }> {
    const response = await apiClient.post(`/api/v1/wellness/sleep/${id}/transcribe`, {})
    return response.data
  }

  // ========== 冥想相关 ==========
  async createMeditationSession(data: {
    duration: number
    type: 'breathing' | 'mindfulness' | 'body-scan' | 'guided'
    notes?: string
  }): Promise<MeditationSession> {
    const response = await apiClient.post<MeditationSession>(this.meditationUrl, data)
    return response.data
  }

  async getMeditationSessions(params?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }): Promise<MeditationSession[]> {
    const response = await apiClient.get<MeditationSession[]>(this.meditationUrl, { params })
    return response.data
  }

  // ========== 统计数据 ==========
  async getStats(): Promise<WellnessStats> {
    const response = await apiClient.get<WellnessStats>('/api/v1/wellness/stats')
    return response.data
  }

  // 获取冥想类型列表
  getMeditationTypes(): MeditationType[] {
    return MEDITATION_TYPES
  }
}

export const wellnessService = new WellnessService()
