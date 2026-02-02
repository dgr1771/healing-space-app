/**
 * 白噪音播放服务
 * 用于睡眠监测时播放背景白噪音
 */

export interface WhiteNoiseType {
  id: string
  name: string
  description: string
  icon: string
  url?: string
  file?: File
  isLocal: boolean
}

class WhiteNoiseService {
  private audio: HTMLAudioElement | null = null
  private isPlaying = false
  private volume = 0.5

  // 预设白噪音类型（已移除预设，用户需上传自定义白噪音）
  noiseTypes: WhiteNoiseType[] = []

  // 获取所有白噪音类型
  getAllTypes(): WhiteNoiseType[] {
    return [...this.noiseTypes]
  }

  // 添加自定义白噪音音频
  addCustomNoise(file: File, name?: string): WhiteNoiseType {
    const noise: WhiteNoiseType = {
      id: `custom-${Date.now()}`,
      name: name || file.name.replace(/\.[^/.]+$/, ''),
      description: '自定义白噪音',
      icon: '🎵',
      file,
      isLocal: true,
    }
    this.noiseTypes.push(noise)
    return noise
  }

  // 移除自定义白噪音
  removeCustomNoise(id: string): void {
    this.noiseTypes = this.noiseTypes.filter(n => n.id !== id)
    if (this.audio && this.audio.src.includes(id)) {
      this.stop()
    }
  }

  // 播放白噪音
  async playNoise(noiseId: string): Promise<void> {
    const noise = this.noiseTypes.find(n => n.id === noiseId)

    if (!noise) {
      throw new Error('未找到该白噪音')
    }

    // 如果是预设类型且没有文件，提示用户上传
    if (!noise.isLocal && !noise.file) {
      throw new Error('该白噪音暂无音频文件，请上传自定义白噪音音频')
    }

    this.stop()

    this.audio = new Audio()
    this.audio.loop = true
    this.audio.volume = this.volume

    try {
      if (noise.file) {
        this.audio.src = URL.createObjectURL(noise.file)
      } else if (noise.url) {
        this.audio.src = noise.url
      }

      await this.audio.play()
      this.isPlaying = true
    } catch (error) {
      console.error('播放白噪音失败:', error)
      this.audio = null
      this.isPlaying = false
      throw error
    }
  }

  // 停止播放
  stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      if (this.audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.audio.src)
      }
      this.audio = null
      this.isPlaying = false
    }
  }

  // 设置音量 (0-1)
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.audio) {
      this.audio.volume = this.volume
    }
  }

  // 获取当前音量
  getVolume(): number {
    return this.volume
  }

  // 获取播放状态
  getStatus(): { isPlaying: boolean; volume: number } {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
    }
  }

  // 清理资源
  cleanup(): void {
    this.stop()
  }
}

export const whiteNoiseService = new WhiteNoiseService()
