/**
 * 凯格尔训练API服务
 */

import apiClient from './apiClient'
import {
  type KegelExercise,
  type KegelStats,
  type KegelLevelConfig,
} from '../types/kegel'

const LEVEL_CONFIGS: Record<string, KegelLevelConfig> = {
  beginner: {
    level: 'beginner',
    name: '初级',
    description: '适合新手，较短的收缩时间',
    holdTime: 3,
    relaxTime: 3,
    reps: 10,
    recommendedDuration: 60,
  },
  intermediate: {
    level: 'intermediate',
    name: '中级',
    description: '有一定基础，增加收缩时长',
    holdTime: 5,
    relaxTime: 5,
    reps: 15,
    recommendedDuration: 150,
  },
  advanced: {
    level: 'advanced',
    name: '高级',
    description: '挑战自我，最大强度训练',
    holdTime: 10,
    relaxTime: 5,
    reps: 20,
    recommendedDuration: 300,
  },
}

class KegelService {
  private baseUrl = '/api/v1/kegel'

  // 记录登录/访问
  async recordLogin(): Promise<{ success: boolean; alreadyLoggedIn: boolean }> {
    const response = await apiClient.post<{ success: boolean; alreadyLoggedIn: boolean }>(`${this.baseUrl}/login`)
    return response.data
  }

  // 获取难度配置
  getLevelConfig(level: 'beginner' | 'intermediate' | 'advanced'): KegelLevelConfig {
    return LEVEL_CONFIGS[level]
  }

  // 获取所有难度配置
  getAllLevelConfigs(): KegelLevelConfig[] {
    return Object.values(LEVEL_CONFIGS)
  }

  // 完成一次训练
  async completeExercise(data: {
    duration: number
    holdTime: number
    relaxTime: number
    reps: number
    level: 'beginner' | 'intermediate' | 'advanced'
  }): Promise<KegelExercise> {
    const response = await apiClient.post<KegelExercise>(this.baseUrl, data)
    return response.data
  }

  // 获取训练历史
  async getExercises(params?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }): Promise<KegelExercise[]> {
    const response = await apiClient.get<KegelExercise[]>(this.baseUrl, { params })
    return response.data
  }

  // 获取统计数据
  async getStats(): Promise<KegelStats> {
    const response = await apiClient.get<KegelStats>(`${this.baseUrl}/stats`)
    return response.data
  }

  // 删除训练记录
  async deleteExercise(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

export const kegelService = new KegelService()
