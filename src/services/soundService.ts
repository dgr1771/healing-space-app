/**
 * 声音服务
 * 提供滴答声、闹钟提醒等功能
 */

export class SoundService {
  private audioContext: AudioContext | null = null
  private tickOscillator: OscillatorNode | null = null
  private tickGainNode: GainNode | null = null
  private isPlaying = false

  /**
   * 初始化音频上下文
   */
  private async initAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    // 恢复音频上下文（某些浏览器需要用户交互才能启动）
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * 开始播放滴答声
   */
  async startTick(interval: number = 1000): Promise<void> {
    await this.initAudioContext()

    if (this.isPlaying || !this.audioContext) return

    this.isPlaying = true
    this.tickGainNode = this.audioContext.createGain()
    this.tickGainNode.connect(this.audioContext.destination)
    this.tickGainNode.gain.value = 0.1 // 音量较小，不会太吵

    const playTick = async () => {
      if (!this.isPlaying || !this.audioContext || !this.tickGainNode) return

      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // 设置滴答声频率（高音短促）
      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      // 音量包络：快速淡入淡出
      const now = this.audioContext.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, now + 0.05)

      oscillator.start(now)
      oscillator.stop(now + 0.05)

      // 下一次滴答
      if (this.isPlaying) {
        setTimeout(playTick, interval)
      }
    }

    playTick()
  }

  /**
   * 停止播放滴答声
   */
  stopTick(): void {
    this.isPlaying = false
  }

  /**
   * 播放完成提醒音（温和的闹钟声）
   */
  async playCompletionAlarm(): Promise<void> {
    await this.initAudioContext()

    if (!this.audioContext) return

    // 创建多个音符，形成温和的旋律
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5 (C大调和弦)
    const now = this.audioContext.currentTime

    notes.forEach((frequency, index) => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      // 每个音符依次播放
      const startTime = now + index * 0.3
      const duration = 0.4

      // 音量包络
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + duration - 0.1)
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    })

    // 如果支持，触发震动
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }
  }

  /**
   * 播放阶段切换提示音（轻微的提示声）
   */
  async playPhaseChange(): Promise<void> {
    await this.initAudioContext()

    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // 温和的提示音
    oscillator.frequency.value = 440 // A4
    oscillator.type = 'sine'

    const now = this.audioContext.currentTime
    const duration = 0.15

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02)
    gainNode.gain.linearRampToValueAtTime(0, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)

    // 轻微震动
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  /**
   * 播放开始音（积极的提示）
   */
  async playStart(): Promise<void> {
    await this.initAudioContext()

    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // 上升的音调
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
    oscillator.frequency.linearRampToValueAtTime(
      600,
      this.audioContext.currentTime + 0.1
    )
    oscillator.type = 'sine'

    const now = this.audioContext.currentTime
    const duration = 0.2

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)

    // 震动反馈
    if ('vibrate' in navigator) {
      navigator.vibrate(100)
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.stopTick()

    if (this.tickOscillator) {
      this.tickOscillator.stop()
      this.tickOscillator = null
    }

    if (this.tickGainNode) {
      this.tickGainNode.disconnect()
      this.tickGainNode = null
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

// 创建全局实例
export const soundService = new SoundService()
