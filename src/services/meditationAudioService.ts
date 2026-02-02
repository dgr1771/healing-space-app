/**
 * 冥想引导音频服务
 * 支持预设引导音频和用户上传自定义音频
 */

export interface MeditationGuide {
  id: string
  name: string
  description: string
  duration: number // 分钟
  type: 'breathing' | 'mindfulness' | 'body-scan' | 'sleep'
  url?: string // 音频URL（可选）
  file?: File // 本地文件（可选）
  language: 'zh' | 'en'
  isLocal?: boolean // 是否为用户上传
  source?: string // 音频来源
}

// 预设冥想引导音频（已移除预设，用户需上传自定义音频）
const DEFAULT_GUIDES: MeditationGuide[] = []

class MeditationAudioService {
  private audio: HTMLAudioElement | null = null
  private isPlaying = false
  private customGuides: MeditationGuide[] = []

  // 获取所有可用的冥想引导（预设 + 用户上传）
  getAllGuides(): MeditationGuide[] {
    return [...DEFAULT_GUIDES, ...this.customGuides]
  }

  // 根据类型获取冥想引导
  getGuidesByType(type: MeditationGuide['type']): MeditationGuide[] {
    return this.getAllGuides().filter(guide => guide.type === type)
  }

  // 添加自定义引导音频
  addCustomGuide(file: File, type: MeditationGuide['type'], name?: string): MeditationGuide {
    const guide: MeditationGuide = {
      id: `custom-${Date.now()}`,
      name: name || file.name.replace(/\.[^/.]+$/, ''),
      description: `自定义${type === 'breathing' ? '呼吸' : type === 'mindfulness' ? '正念' : type === 'body-scan' ? '身体扫描' : '助眠'}引导音频`,
      duration: 10, // 默认时长，用户可以手动调整计时器
      type,
      file,
      language: 'zh',
      isLocal: true,
      source: '用户上传',
    }
    this.customGuides.push(guide)
    return guide
  }

  // 移除自定义引导
  removeCustomGuide(id: string): void {
    this.customGuides = this.customGuides.filter(g => g.id !== id)
    if (this.audio && this.audio.src.includes(id)) {
      this.stop()
    }
  }

  // 播放冥想引导音频
  async playGuide(guideId: string): Promise<void> {
    const allGuides = this.getAllGuides()
    const guide = allGuides.find(g => g.id === guideId)

    if (!guide) {
      throw new Error('未找到该冥想引导')
    }

    // 如果没有音频源，返回提示
    if (!guide.file && !guide.url) {
      throw new Error('该引导暂无音频文件')
    }

    // 停止当前播放的音频
    this.stop()

    // 创建新的音频实例
    this.audio = new Audio()
    this.audio.loop = false // 引导音频不循环播放

    try {
      // 优先使用本地文件，其次使用URL
      if (guide.file) {
        this.audio.src = URL.createObjectURL(guide.file)
      } else if (guide.url) {
        this.audio.src = guide.url
      } else {
        throw new Error('没有可用的音频源')
      }

      await this.audio.play()
      this.isPlaying = true
    } catch (error) {
      console.error('播放冥想引导失败:', error)
      if (this.audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.audio.src)
      }
      this.audio = null
      this.isPlaying = false
      throw error
    }
  }

  // 暂停播放
  pause(): void {
    if (this.audio && this.isPlaying) {
      this.audio.pause()
      this.isPlaying = false
    }
  }

  // 恢复播放
  async resume(): Promise<void> {
    if (this.audio && !this.isPlaying) {
      try {
        await this.audio.play()
        this.isPlaying = true
      } catch (error) {
        console.error('恢复播放失败:', error)
        throw error
      }
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
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume))
    }
  }

  // 获取当前播放状态
  getStatus(): { isPlaying: boolean; volume: number } {
    return {
      isPlaying: this.isPlaying,
      volume: this.audio?.volume || 1,
    }
  }

  // 清理资源
  cleanup(): void {
    this.stop()
    this.customGuides = []
  }
}

export const meditationAudioService = new MeditationAudioService()
