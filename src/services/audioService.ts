/**
 * 音频录制和睡眠监测服务
 * 使用 Web Audio API 录制音频并检测打鼾和梦话
 */

export interface SleepEventData {
  type: 'snore' | 'sleep_talking' | 'noise'
  timestamp: number
  duration: number
  audioBlob?: Blob
  audioUrl?: string
  transcript?: string // 语音识别文字（仅限梦话）
}

export interface AudioConfig {
  sampleRate: number
  channelCount: number
  bitDepth: number
}

export class AudioMonitor {
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private chunks: BlobPart[] = []
  private isRecording = false
  private sleepEvents: SleepEventData[] = []
  private monitoringInterval: number | null = null
  private onEventCallback?: (event: SleepEventData) => void

  // 梦话录制相关状态
  private isTalking = false
  private talkingStartTime: number | null = null
  private talkingChunks: BlobPart[] = []
  private talkingTimeout: number | null = null

  private readonly SNORE_THRESHOLD = -20 // dB
  private readonly TALKING_THRESHOLD = -30 // dB
  private readonly MIN_TALKING_DURATION = 1000 // ms - 最小梦话持续时间
  private readonly TALKING_TIMEOUT = 3000 // ms - 梦话结束延迟（等待3秒确认结束）

  /**
   * 初始化音频监控
   */
  async initialize(config?: Partial<AudioConfig>): Promise<void> {
    try {
      // 请求麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config?.sampleRate || 44100,
          channelCount: config?.channelCount || 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // 创建音频上下文
      this.audioContext = new AudioContext({
        sampleRate: config?.sampleRate || 44100,
      })

      // 创建分析器
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8

      // 连接音频流
      const source = this.audioContext.createMediaStreamSource(this.stream)
      source.connect(this.analyser)

      // 设置 MediaRecorder
      const options: MediaRecorderOptions = {
        mimeType: this.getSupportedMimeType(),
        audioBitsPerSecond: 128000,
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options)

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data)
        }
      }

      console.log('音频监控初始化成功')
    } catch (error) {
      console.error('音频监控初始化失败:', error)
      throw new Error('无法访问麦克风，请检查权限设置')
    }
  }

  /**
   * 开始睡眠监测
   */
  startMonitoring(onEvent?: (event: SleepEventData) => void): void {
    if (!this.mediaRecorder || !this.analyser) {
      throw new Error('音频监控未初始化')
    }

    this.onEventCallback = onEvent
    this.isRecording = true
    this.chunks = []
    this.sleepEvents = []

    // 重置梦话录制状态
    this.isTalking = false
    this.talkingStartTime = null
    this.talkingChunks = []
    if (this.talkingTimeout) {
      clearTimeout(this.talkingTimeout)
      this.talkingTimeout = null
    }

    // 开始录制
    this.mediaRecorder.start(1000) // 每秒生成一个数据块

    // 开始监测音频
    this.monitoringInterval = window.setInterval(() => {
      this.analyzeAudio()
    }, 500)

    console.log('开始睡眠监测')
  }

  /**
   * 停止监测并返回所有事件
   */
  async stopMonitoring(): Promise<SleepEventData[]> {
    if (!this.mediaRecorder || !this.isRecording) {
      return this.sleepEvents
    }

    this.isRecording = false

    // 停止监测间隔
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    // 如果正在录制梦话，完成它
    if (this.isTalking) {
      this.finishTalkingEvent()
    }

    // 停止录制
    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        resolve(this.sleepEvents)
      }

      this.mediaRecorder!.stop()
    })
  }

  /**
   * 分析音频数据（检测打鼾和梦话）
   * 优先检测梦话，如果检测到梦话则跳过打鼾检测，避免重复计算
   */
  private analyzeAudio(): void {
    if (!this.analyser || !this.isRecording) return

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteFrequencyData(dataArray)

    // 计算平均音量 (dB)
    const average = this.calculateAverageVolume(dataArray)
    const db = 20 * Math.log10(average / 255)

    // 优先检测梦话（人声频率范围）
    const isTalkingNow = this.detectTalking(dataArray, db)

    if (isTalkingNow) {
      // 检测到梦话
      if (!this.isTalking) {
        // 开始新的梦话事件
        this.startTalkingEvent()
      }
      // 累积梦话音频数据
      if (this.chunks.length > 0) {
        this.talkingChunks.push(this.chunks[this.chunks.length - 1])
      }
      // 重置超时计时器
      if (this.talkingTimeout) {
        clearTimeout(this.talkingTimeout)
      }
      this.talkingTimeout = window.setTimeout(() => {
        this.finishTalkingEvent()
      }, this.TALKING_TIMEOUT)
    } else {
      // 没有检测到梦话，检测打鼾（仅在未说话时）
      if (!this.isTalking && this.detectSnore(dataArray, db)) {
        this.recordEvent({
          type: 'snore',
          timestamp: Date.now(),
          duration: 2000,
        })
      }
    }
  }

  /**
   * 检测打鼾
   */
  private detectSnore(dataArray: Uint8Array, db: number): boolean {
    // 打鼾特征：低频、周期性、一定音量
    const lowFrequency = dataArray.slice(0, 10)
    const lowFreqAvg = lowFrequency.reduce((a, b) => a + b, 0) / lowFrequency.length

    // 低频能量强 + 音量超过阈值
    return lowFreqAvg > 100 && db > this.SNORE_THRESHOLD
  }

  /**
   * 检测梦话
   * 返回是否检测到梦话（boolean）
   */
  private detectTalking(dataArray: Uint8Array, db: number): boolean {
    // 梦话特征：中高频、人声频率范围
    const voiceFrequencies = dataArray.slice(10, 100)
    const voiceFreqAvg =
      voiceFrequencies.reduce((a, b) => a + b, 0) / voiceFrequencies.length

    // 人声频率 + 音量超过阈值
    return voiceFreqAvg > 50 && db > this.TALKING_THRESHOLD
  }

  /**
   * 开始梦话事件
   */
  private startTalkingEvent(): void {
    this.isTalking = true
    this.talkingStartTime = Date.now()
    this.talkingChunks = []
    console.log('🎤 开始检测梦话')
  }

  /**
   * 完成梦话事件
   */
  private finishTalkingEvent(): void {
    if (!this.isTalking || !this.talkingStartTime) return

    const endTime = Date.now()
    const duration = endTime - this.talkingStartTime

    // 只记录超过最小时长的梦话
    if (duration >= this.MIN_TALKING_DURATION) {
      // 创建音频 Blob
      let audioBlob: Blob | undefined
      let audioUrl: string | undefined

      if (this.talkingChunks.length > 0) {
        audioBlob = new Blob(this.talkingChunks, { type: 'audio/webm' })
        audioUrl = URL.createObjectURL(audioBlob)
        console.log(`🎤 梦话录制完成，时长: ${Math.round(duration / 1000)}秒，音频块: ${this.talkingChunks.length}`)
      } else {
        console.warn('⚠️ 梦话事件没有音频数据')
      }

      // 记录梦话事件
      this.recordEvent({
        type: 'sleep_talking',
        timestamp: this.talkingStartTime,
        duration: duration,
        audioBlob,
        audioUrl,
      })
    } else {
      console.log(`⏭️ 梦话时长不足(${Math.round(duration / 1000)}秒 < ${this.MIN_TALKING_DURATION / 1000}秒)，跳过记录`)
    }

    // 重置状态
    this.isTalking = false
    this.talkingStartTime = null
    this.talkingChunks = []
    if (this.talkingTimeout) {
      clearTimeout(this.talkingTimeout)
      this.talkingTimeout = null
    }
  }

  /**
   * 记录睡眠事件
   * 注意：梦话事件的音频已经在 finishTalkingEvent 中处理
   */
  private recordEvent(event: SleepEventData): void {
    // 打鼾事件：防止重复记录（5秒内相同类型的事件）
    if (event.type === 'snore') {
      const lastEvent = this.sleepEvents[this.sleepEvents.length - 1]
      if (
        lastEvent &&
        lastEvent.type === event.type &&
        event.timestamp - lastEvent.timestamp < 5000
      ) {
        return
      }
    }

    // 梦话事件的音频已经在 finishTalkingEvent 中处理，这里只需要记录
    this.sleepEvents.push(event)

    // 触发回调
    if (this.onEventCallback) {
      this.onEventCallback(event)
    }
  }

  /**
   * 计算平均音量
   */
  private calculateAverageVolume(dataArray: Uint8Array): number {
    return dataArray.reduce((a, b) => a + b, 0) / dataArray.length
  }

  /**
   * 获取支持的 MIME 类型
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/mpeg',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'audio/webm'
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    if (this.talkingTimeout) {
      clearTimeout(this.talkingTimeout)
      this.talkingTimeout = null
    }

    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }

    // 重置梦话状态
    this.isTalking = false
    this.talkingStartTime = null
    this.talkingChunks = []

    this.isRecording = false
    console.log('音频监控已清理')
  }

  /**
   * 获取当前状态
   */
  isActive(): boolean {
    return this.isRecording
  }
}

// 创建全局实例
export const audioMonitor = new AudioMonitor()
