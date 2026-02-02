/**
 * SQLite 数据库初始化和管理
 * 提供数据持久化功能
 */

import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据库文件路径
const dbPath = path.join(__dirname, 'data', 'healing-space.db')

// 确保数据目录存在
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 创建数据库连接
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message)
  } else {
    console.log('✅ 数据库连接成功:', dbPath)
    initializeTables()
  }
})

/**
 * 初始化数据库表
 */
function initializeTables() {
  // 凯格尔训练记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS kegel_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      level TEXT,
      duration INTEGER,
      contractions INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 凯格尔登录记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS kegel_logins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 睡眠记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS sleep_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bedTime TEXT NOT NULL,
      wakeTime TEXT NOT NULL,
      quality INTEGER NOT NULL,
      mood TEXT NOT NULL,
      notes TEXT,
      duration REAL,
      goldenSleepTime REAL,
      snoreCount INTEGER,
      talkingCount INTEGER,
      events TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 冥想记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS meditation_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      duration INTEGER NOT NULL,
      type TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建表失败:', err)
    } else {
      console.log('✅ 数据库表初始化完成')
    }
  })
}

/**
 * 凯格尔训练相关操作
 */
export const kegelDB = {
  // 获取所有训练记录
  getAll: (limit = 20, offset = 0) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM kegel_exercises ORDER BY date DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        }
      )
    })
  },

  // 添加训练记录
  add: (exercise) => {
    return new Promise((resolve, reject) => {
      const { date, level, duration, contractions, notes } = exercise
      db.run(
        `INSERT INTO kegel_exercises (date, level, duration, contractions, notes) VALUES (?, ?, ?, ?, ?)`,
        [date, level, duration, contractions, notes],
        function(err) {
          if (err) reject(err)
          else resolve({ id: this.lastID, ...exercise })
        }
      )
    })
  },

  // 删除训练记录
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM kegel_exercises WHERE id = ?`, [id], (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  },

  // 获取统计数据
  getStats: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT
          COUNT(*) as total_exercises,
          SUM(duration) as total_time,
          COUNT(DISTINCT DATE(date)) as login_days
        FROM kegel_exercises
      `, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          const stats = rows[0] || {}
          db.all(`
            SELECT level, COUNT(*) as count
            FROM kegel_exercises
            GROUP BY level
          `, (err2, levelRows) => {
            if (err2) reject(err2)
            else {
              resolve({
                ...stats,
                levelDistribution: {
                  beginner: levelRows.find(r => r.level === 'beginner')?.count || 0,
                  intermediate: levelRows.find(r => r.level === 'intermediate')?.count || 0,
                  advanced: levelRows.find(r => r.level === 'advanced')?.count || 0
                }
              })
            }
          })
        }
      })
    })
  },

  // 添加登录记录
  addLogin: (date) => {
    return new Promise((resolve, reject) => {
      const dateStr = new Date(date).toDateString()
      db.run(
        `INSERT OR IGNORE INTO kegel_logins (date) VALUES (?)`,
        [dateStr],
        function(err) {
          if (err) reject(err)
          else resolve({ id: this.lastID, date: dateStr })
        }
      )
    })
  },

  // 获取所有登录记录
  getLogins: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM kegel_logins ORDER BY date DESC`, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
}

/**
 * 睡眠记录相关操作
 */
export const sleepDB = {
  // 获取所有睡眠记录
  getAll: (limit = 20, offset = 0) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM sleep_records ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        }
      )
    })
  },

  // 添加睡眠记录
  add: (record) => {
    return new Promise((resolve, reject) => {
      const {
        bedTime, wakeTime, quality, mood, notes,
        duration, goldenSleepTime, snoreCount, talkingCount, events
      } = record
      db.run(
        `INSERT INTO sleep_records (bedTime, wakeTime, quality, mood, notes, duration, goldenSleepTime, snoreCount, talkingCount, events)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bedTime, wakeTime, quality, mood, notes,
          duration, goldenSleepTime, snoreCount, talkingCount,
          events ? JSON.stringify(events) : null
        ],
        function(err) {
          if (err) reject(err)
          else resolve({ id: this.lastID, ...record })
        }
      )
    })
  },

  // 根据ID获取睡眠记录
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM sleep_records WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err)
          else resolve(row)
        }
      )
    })
  },

  // 更新睡眠记录
  update: (id, record) => {
    return new Promise((resolve, reject) => {
      const {
        bedTime, wakeTime, quality, mood, notes,
        duration, goldenSleepTime, snoreCount, talkingCount, events
      } = record
      db.run(
        `UPDATE sleep_records
         SET bedTime = ?, wakeTime = ?, quality = ?, mood = ?, notes = ?,
             duration = ?, goldenSleepTime = ?, snoreCount = ?, talkingCount = ?, events = ?
         WHERE id = ?`,
        [
          bedTime, wakeTime, quality, mood, notes,
          duration, goldenSleepTime, snoreCount, talkingCount,
          events ? JSON.stringify(events) : null,
          id
        ],
        function(err) {
          if (err) reject(err)
          else resolve({ id, ...record })
        }
      )
    })
  }
}

/**
 * 冥想记录相关操作
 */
export const meditationDB = {
  // 获取所有冥想记录
  getAll: (limit = 20, offset = 0) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM meditation_sessions ORDER BY date DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        }
      )
    })
  },

  // 添加冥想记录
  add: (session) => {
    return new Promise((resolve, reject) => {
      const { date, duration, type, notes } = session
      db.run(
        `INSERT INTO meditation_sessions (date, duration, type, notes) VALUES (?, ?, ?, ?)`,
        [date, duration, type, notes],
        function(err) {
          if (err) reject(err)
          else resolve({ id: this.lastID, ...session })
        }
      )
    })
  },

  // 获取统计
  getStats: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT
          COUNT(*) as total_sessions,
          SUM(duration) as total_minutes
        FROM meditation_sessions
      `, (err, rows) => {
        if (err) reject(err)
        else resolve(rows[0] || {})
      })
    })
  }
}

// 工具函数：计算连续天数
export function calculateConsecutiveDays(records) {
  if (records.length === 0) return 0

  const dates = [...new Set(records.map(r =>
    new Date(r.date || r.created_at).toDateString()
  ))].sort((a, b) => new Date(b) - new Date(a))

  let consecutive = 1
  const today = new Date().toDateString()

  if (dates[0] !== today) {
    return 0
  }

  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i])
    const next = new Date(dates[i + 1])
    const diffDays = (current - next) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      consecutive++
    } else {
      break
    }
  }

  return consecutive
}

// 工具函数：计算最长连续天数
export function calculateLongestStreak(records) {
  if (records.length === 0) return 0

  const dates = [...new Set(records.map(r =>
    new Date(r.date || r.created_at).toDateString()
  ))].sort((a, b) => new Date(a) - new Date(b))

  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

// 工具函数：计算本周训练次数
export function calculateThisWeekCount(records) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  return records.filter(r => new Date(r.date || r.created_at) >= startOfWeek).length
}

// 工具函数：计算本月训练次数
export function calculateThisMonthCount(records) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return records.filter(r => new Date(r.date || r.created_at) >= startOfMonth).length
}

// 工具函数：计算当前等级
export function calculateLevel(totalExercises, totalDuration) {
  if (totalExercises < 5) return 'beginner'
  if (totalExercises < 15) return 'intermediate'
  return 'advanced'
}
