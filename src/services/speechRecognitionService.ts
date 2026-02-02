/**
 * 语音识别服务
 * 用于将睡眠时的梦话转换为文字
 */

export interface SpeechRecognitionResult {
  transcript: string // 识别的文字
  confidence: number // 置信度 0-1
  isFinal: boolean // 是否为最终结果
}

class SpeechRecognitionService {
  private recognition: any = null
  private isRecognizing = false
  private onResultCallback?: (result: SpeechRecognitionResult) => void

  /**
   * 初始化语音识别
   */
  async initialize(): Promise<void> {
    // 检查浏览器支持
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      throw new Error('您的浏览器不支持语音识别功能')
    }

    this.recognition = new SpeechRecognition()
    this.recognition.lang = 'zh-CN' // 设置为中文
    this.recognition.continuous = false // 不连续识别
    this.recognition.interimResults = true // 返回临时结果

    this.recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1][0]
      const result: SpeechRecognitionResult = {
        transcript: lastResult.transcript,
        confidence: lastResult.confidence,
        isFinal: lastResult.isFinal,
      }

      if (this.onResultCallback) {
        this.onResultCallback(result)
      }
    }

    this.recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error)
    }

    this.recognition.onend = () => {
      this.isRecognizing = false
    }

    console.log('语音识别服务初始化成功')
  }

  /**
   * 从音频文件识别语音（将音频转换为文字）
   */
  async recognizeFromAudio(audioBlob: Blob): Promise<string> {
    if (!this.recognition) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      try {
        // 创建音频元素
        const audio = new Audio()
        audio.src = URL.createObjectURL(audioBlob)

        // 等待音频加载完成
        audio.onloadeddata = async () => {
          // 创建音频上下文
          const audioContext = new AudioContext()
          const source = audioContext.createMediaElementSource(audio)

          // 创建目标节点（用于捕获音频）
          const destination = audioContext.createMediaStreamDestination()
          source.connect(destination)

          // 使用流的识别（如果浏览器支持）
          if (destination.stream) {
            // 尝试使用流进行识别
            await this.recognition.start()
            this.isRecognizing = true

            // 这里需要更复杂的处理，目前简化处理
            setTimeout(() => {
              this.recognition.stop()
              resolve('语音识别已启动，但需要浏览器支持')
            }, 3000)
          } else {
            reject(new Error('浏览器不支持音频流识别'))
          }
        }

        audio.onerror = () => {
          reject(new Error('音频加载失败'))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 从实时音频识别（未来扩展用）
   */
  async startRealtimeRecognition(onResult: (result: SpeechRecognitionResult) => void): Promise<void> {
    if (!this.recognition) {
      await this.initialize()
    }

    this.onResultCallback = onResult
    await this.recognition.start()
    this.isRecognizing = true
  }

  /**
   * 停止识别
   */
  async stopRecognition(): Promise<void> {
    if (this.recognition && this.isRecognizing) {
      return new Promise((resolve) => {
        this.recognition.onend = () => {
          this.isRecognizing = false
          resolve()
        }
        this.recognition.stop()
      })
    }
  }

  /**
   * 简化版：直接保存梦话音频，标记待识别
   * 实际文字识别可以在用户查看记录时进行
   */
  markForRecognition(_audioBlob: Blob): string {
    // 生成唯一ID
    const recognitionId = `speech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 在实际应用中，这里应该：
    // 1. 将音频发送到后端API
    // 2. 后端调用专业的语音识别服务（如百度、讯飞、Azure等）
    // 3. 返回识别结果

    return recognitionId
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.recognition && this.isRecognizing) {
      this.recognition.stop()
    }
    this.isRecognizing = false
  }

  /**
   * 检查浏览器是否支持语音识别
   */
  isSupported(): boolean {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  }
}

export const speechRecognitionService = new SpeechRecognitionService()
