/**
 * 语音识别服务 - 使用 Transformers.js 本地运行 Whisper 模型
 * 支持：自动语音识别 (ASR)，无需外部API
 */

import { pipeline, env } from '@xenova/transformers'

// 禁用本地模型检查，从HuggingFace Hub下载
env.allowLocalModels = false
env.allowRemoteModels = true

class ASRService {
  constructor() {
    this.transcriber = null
    this.isModelLoaded = false
    this.initializing = false
  }

  /**
   * 初始化Whisper模型
   */
  async initialize() {
    if (this.isModelLoaded) {
      return
    }

    if (this.initializing) {
      // 如果正在初始化，等待完成
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return
    }

    try {
      this.initializing = true
      console.log('🎤 正在加载 Whisper 模型（首次使用需要下载，约74MB）...')

      // 使用 Xenova 的 Whisper Tiny 模型（最小最快）
      this.transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny')

      console.log('✅ Whisper 模型加载成功')
      this.isModelLoaded = true
    } catch (error) {
      console.error('❌ Whisper 模型加载失败:', error)
      throw new Error('语音识别模型初始化失败')
    } finally {
      this.initializing = false
    }
  }

  /**
   * 识别音频（Base64格式）
   * @param {string} base64Audio - Base64编码的音频数据
   * @param {string} mimeType - 音频MIME类型
   * @returns {Promise<{text: string, confidence: number}>}
   */
  async transcribe(base64Audio, mimeType = 'audio/webm') {
    if (!this.isModelLoaded) {
      await this.initialize()
    }

    try {
      // 将Base64转换为Float32Array
      const audioData = this.base64ToAudioData(base64Audio)

      // 调用Whisper进行识别
      const result = await this.transcriber(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: 'chinese', // 优先识别中文
        task: 'transcribe',
        return_timestamps: false,
      })

      return {
        text: result?.text?.trim() || '',
        confidence: 0.95, // Transformers.js不提供置信度，使用固定值
      }
    } catch (error) {
      console.error('语音识别失败:', error)
      throw error
    }
  }

  /**
   * 批量识别梦话事件
   * @param {Array} events - 梦话事件数组
   * @returns {Promise<Array>} 识别后的事件数组
   */
  async transcribeEvents(events) {
    const results = []

    for (let i = 0; i < events.length; i++) {
      const event = events[i]

      // 只处理梦话事件且有音频数据的事件
      if (event.type === 'sleep_talking' && event.audioData && !event.transcript) {
        try {
          console.log(`🎤 识别梦话 ${i + 1}/${events.length}...`)

          const result = await this.transcribe(event.audioData, 'audio/webm')

          results.push({
            ...event,
            transcript: result.text || '(未能识别)',
          })

          console.log(`✅ 识别完成: "${result.text.substring(0, 30)}${result.text.length > 30 ? '...' : ''}"`)
        } catch (error) {
          console.error(`❌ 梦话 ${i + 1} 识别失败:`, error.message)
          results.push({
            ...event,
            transcript: '(识别失败)',
          }) // 标记识别失败但保留事件
        }
      } else {
        results.push(event)
      }
    }

    return results
  }

  /**
   * Base64转换为音频数据（Float32Array）
   * 注意：这是一个简化版本，实际使用可能需要更复杂的音频解码
   */
  base64ToAudioData(base64Data) {
    // 由于webm格式解码较复杂，这里返回原始音频URL供模型处理
    // Transformers.js支持从URL加载音频
    return `data:audio/webm;base64,${base64Data}`
  }

  /**
   * 延迟函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 检查模型是否已加载
   */
  isReady() {
    return this.isModelLoaded
  }

  /**
   * 获取模型状态
   */
  getStatus() {
    return {
      isReady: this.isModelLoaded,
      isInitializing: this.initializing,
      modelName: 'Xenova/whisper-tiny',
    }
  }
}

export const asrService = new ASRService()
