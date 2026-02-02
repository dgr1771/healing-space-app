/**
 * 疗愈空间 - 健康管理与身心调养应用 - 后端 API 服务
 * 端口: 8001
 * 使用 SQLite 数据库持久化存储
 */

import express from 'express'
import cors from 'cors'
import {
  kegelDB,
  sleepDB,
  meditationDB,
  calculateConsecutiveDays,
  calculateLongestStreak,
  calculateThisWeekCount,
  calculateThisMonthCount,
  calculateLevel
} from './database.js'
import { asrService } from './asrService.js'

const app = express()
const PORT = 8001

// 中间件
app.use(cors())
app.use(express.json({ limit: '50mb' })) // 增加请求体大小限制以支持音频数据
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// ========== 凯格尔训练 API ==========

// 记录登录/访问
app.post('/api/v1/kegel/login', async (req, res) => {
  try {
    const result = await kegelDB.addLogin(new Date())
    res.json({ success: true, alreadyLoggedIn: false })
  } catch (error) {
    // 如果今天已经记录过登录
    res.json({ success: true, alreadyLoggedIn: true })
  }
})

// 获取训练历史
app.get('/api/v1/kegel', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const result = await kegelDB.getAll(parseInt(limit), parseInt(offset))
    res.json(result)
  } catch (error) {
    console.error('获取训练历史失败:', error)
    res.status(500).json({ error: '获取训练历史失败' })
  }
})

// 完成一次训练
app.post('/api/v1/kegel', async (req, res) => {
  try {
    const exercise = {
      date: new Date().toISOString(),
      ...req.body
    }
    const result = await kegelDB.add(exercise)
    res.json(result)
  } catch (error) {
    console.error('保存训练记录失败:', error)
    res.status(500).json({ error: '保存训练记录失败' })
  }
})

// 获取统计数据
app.get('/api/v1/kegel/stats', async (req, res) => {
  try {
    // 获取基本统计
    const basicStats = await kegelDB.getStats()
    const { total_exercises, total_time, login_days, levelDistribution } = basicStats

    // 获取所有记录和登录记录用于计算其他统计
    const [exercises, logins] = await Promise.all([
      kegelDB.getAll(1000, 0),
      kegelDB.getLogins()
    ])

    // 计算连续天数
    const consecutiveDays = calculateConsecutiveDays(logins)
    const longestStreak = calculateLongestStreak(logins)

    // 计算本周、本月训练次数
    const thisWeekCount = calculateThisWeekCount(exercises)
    const thisMonthCount = calculateThisMonthCount(exercises)

    // 计算平均时长
    const averageDuration = total_exercises > 0 ? total_time / total_exercises : 0

    // 计算当前等级
    const level = calculateLevel(total_exercises, total_time)

    res.json({
      totalExercises: total_exercises || 0,
      totalTime: total_time || 0,
      currentStreak: consecutiveDays,
      longestStreak,
      loginDays: login_days || 0,
      thisWeekCount,
      thisMonthCount,
      averageDuration,
      level,
      levelDistribution
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ error: '获取统计数据失败' })
  }
})

// 删除训练记录
app.delete('/api/v1/kegel/:id', async (req, res) => {
  try {
    const { id } = req.params
    await kegelDB.delete(parseInt(id))
    res.status(204).send()
  } catch (error) {
    console.error('删除训练记录失败:', error)
    res.status(500).json({ error: '删除训练记录失败' })
  }
})

// ========== 睡眠记录 API ==========

app.get('/api/v1/wellness/sleep', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const result = await sleepDB.getAll(parseInt(limit), parseInt(offset))
    res.json(result)
  } catch (error) {
    console.error('获取睡眠记录失败:', error)
    res.status(500).json({ error: '获取睡眠记录失败' })
  }
})

app.post('/api/v1/wellness/sleep', async (req, res) => {
  try {
    const record = req.body
    const result = await sleepDB.add(record)
    res.json(result)
  } catch (error) {
    console.error('保存睡眠记录失败:', error)
    res.status(500).json({ error: '保存睡眠记录失败' })
  }
})

// 睡眠监测 API（包含音频事件）
app.post('/api/v1/wellness/sleep/monitor', async (req, res) => {
  try {
    const { duration, events, goldenSleepTime, snoreCount, talkingCount } = req.body

    const record = {
      bedTime: new Date(Date.now() - duration * 1000).toISOString(),
      wakeTime: new Date().toISOString(),
      quality: calculateSleepQuality({ duration, goldenSleepTime, snoreCount, talkingCount }),
      mood: '自动记录',
      duration, // 秒
      goldenSleepTime,
      snoreCount,
      talkingCount,
      events, // SleepEventData[]
      notes: `监测${Math.round(duration / 60)}分钟，黄金睡眠${Math.round(goldenSleepTime)}分钟`,
    }

    const result = await sleepDB.add(record)
    res.json(result)
  } catch (error) {
    console.error('保存睡眠监测记录失败:', error)
    res.status(500).json({ error: '保存睡眠监测记录失败' })
  }
})

// 计算睡眠质量分数
function calculateSleepQuality(data) {
  let score = 5

  // 时长评分
  if (data.duration < 4 * 3600) score -= 2
  else if (data.duration < 6 * 3600) score -= 1
  else if (data.duration >= 7 * 3600 && data.duration <= 9 * 3600) score += 1

  // 黄金睡眠加分
  if (data.goldenSleepTime > 60) score += 0.5

  // 打鼾扣分
  score -= Math.min(data.snoreCount * 0.1, 1)

  // 梦话轻微扣分
  score -= Math.min(data.talkingCount * 0.05, 0.5)

  return Math.max(1, Math.min(5, Math.round(score * 10) / 10))
}

// ========== 语音识别 API ==========

// 获取ASR服务状态
app.get('/api/v1/wellness/asr/status', (req, res) => {
  try {
    const status = asrService.getStatus()
    res.json(status)
  } catch (error) {
    console.error('获取ASR状态失败:', error)
    res.status(500).json({ error: '获取ASR状态失败' })
  }
})

// 初始化ASR模型
app.post('/api/v1/wellness/asr/initialize', async (req, res) => {
  try {
    await asrService.initialize()
    res.json({ success: true, message: 'Whisper模型初始化成功' })
  } catch (error) {
    console.error('初始化ASR模型失败:', error)
    res.status(500).json({ error: '初始化ASR模型失败' })
  }
})

// 识别睡眠记录中的梦话
app.post('/api/v1/wellness/sleep/:id/transcribe', async (req, res) => {
  try {
    const { id } = req.params

    // 获取睡眠记录
    const record = await sleepDB.getById(parseInt(id))
    if (!record) {
      return res.status(404).json({ error: '睡眠记录不存在' })
    }

    // 解析events字段（可能是JSON字符串或已经是数组）
    let events = record.events
    if (typeof events === 'string') {
      events = JSON.parse(events || '[]')
    }

    // 检查是否有梦话事件
    const sleepTalkingEvents = events.filter(e => e.type === 'sleep_talking' && e.audioData)
    if (sleepTalkingEvents.length === 0) {
      return res.json({ success: true, message: '没有需要识别的梦话记录', events })
    }

    // 批量识别梦话
    console.log(`🎤 开始识别 ${sleepTalkingEvents.length} 条梦话...`)
    const transcribedEvents = await asrService.transcribeEvents(events)

    // 更新睡眠记录
    const updatedRecord = {
      ...record,
      events: JSON.stringify(transcribedEvents)
    }
    await sleepDB.update(parseInt(id), updatedRecord)

    // 统计识别结果
    const transcribedCount = transcribedEvents.filter(
      e => e.type === 'sleep_talking' && e.transcript
    ).length

    res.json({
      success: true,
      message: `成功识别 ${transcribedCount}/${sleepTalkingEvents.length} 条梦话`,
      events: transcribedEvents
    })
  } catch (error) {
    console.error('识别梦话失败:', error)
    res.status(500).json({ error: '识别梦话失败' })
  }
})

// ========== 冥想记录 API ==========

app.get('/api/v1/wellness/meditation', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const result = await meditationDB.getAll(parseInt(limit), parseInt(offset))
    res.json(result)
  } catch (error) {
    console.error('获取冥想记录失败:', error)
    res.status(500).json({ error: '获取冥想记录失败' })
  }
})

app.post('/api/v1/wellness/meditation', async (req, res) => {
  try {
    const session = {
      date: new Date().toISOString(),
      ...req.body
    }
    const result = await meditationDB.add(session)
    res.json(result)
  } catch (error) {
    console.error('保存冥想记录失败:', error)
    res.status(500).json({ error: '保存冥想记录失败' })
  }
})

// ========== 身心疗愈统计 API ==========

app.get('/api/v1/wellness/stats', async (req, res) => {
  try {
    // 获取睡眠和冥想记录
    const [sleepRecords, meditationRecords, meditationStats] = await Promise.all([
      sleepDB.getAll(1000, 0),
      meditationDB.getAll(1000, 0),
      meditationDB.getStats()
    ])

    // 睡眠统计
    const sleepStreak = calculateConsecutiveDays(sleepRecords)
    const avgSleepQuality = sleepRecords.length > 0
      ? sleepRecords.reduce((sum, r) => sum + (r.quality || 0), 0) / sleepRecords.length
      : 0

    // 计算平均睡眠时长（从 bedTime 和 wakeTime 计算）
    let totalSleepHours = 0
    sleepRecords.forEach(r => {
      const bed = new Date(r.bedTime)
      const wake = new Date(r.wakeTime)
      const diff = (wake.getTime() - bed.getTime()) / 1000 / 60 / 60
      totalSleepHours += diff > 0 ? diff : diff + 24
    })
    const avgSleepDuration = sleepRecords.length > 0 ? totalSleepHours / sleepRecords.length : 0

    // 冥想统计
    const meditationStreak = calculateConsecutiveDays(meditationRecords)
    const totalSessions = meditationStats.total_sessions || 0
    const totalMinutes = meditationStats.total_minutes || 0

    res.json({
      sleep: {
        averageDuration: avgSleepDuration,
        averageQuality: avgSleepQuality,
        currentStreak: sleepStreak
      },
      meditation: {
        totalSessions,
        totalMinutes,
        currentStreak: meditationStreak
      }
    })
  } catch (error) {
    console.error('获取身心疗愈统计失败:', error)
    res.status(500).json({ error: '获取身心疗愈统计失败' })
  }
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📋 API 端点:`)
  console.log(`   GET    /api/v1/kegel`)
  console.log(`   POST   /api/v1/kegel`)
  console.log(`   GET    /api/v1/kegel/stats`)
  console.log(`   DELETE /api/v1/kegel/:id`)
  console.log(`   GET    /api/v1/wellness/sleep`)
  console.log(`   POST   /api/v1/wellness/sleep`)
  console.log(`   POST   /api/v1/wellness/sleep/monitor`)
  console.log(`   GET    /api/v1/wellness/asr/status`)
  console.log(`   POST   /api/v1/wellness/asr/initialize`)
  console.log(`   POST   /api/v1/wellness/sleep/:id/transcribe`)
  console.log(`   GET    /api/v1/wellness/meditation`)
  console.log(`   POST   /api/v1/wellness/meditation`)
  console.log(`   GET    /api/v1/wellness/stats`)
  console.log(`💾 数据持久化: SQLite`)
})
