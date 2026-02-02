/**
 * 凯格尔训练历史记录组件
 */

import { useEffect, useState } from 'react'
import { kegelService } from '@services/kegelService'
import { type KegelExercise } from '../../types/kegel'

export default function KegelHistory() {
  const [exercises, setExercises] = useState<KegelExercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await kegelService.getExercises({ limit: 50 })
      setExercises(data)
    } catch (error) {
      console.error('加载历史记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return

    try {
      await kegelService.deleteExercise(id)
      setExercises(exercises.filter(e => e.id !== id))
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const levelName = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  }

  const levelColor = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p>加载中...</p>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
        <div className="text-4xl mb-4">📝</div>
        <p>还没有训练记录，开始第一次训练吧！</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">训练记录</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelColor[exercise.level]}`}>
                    {levelName[exercise.level]}
                  </span>
                  <span className="text-gray-500">
                    {new Date(exercise.date).toLocaleString('zh-CN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">训练时长:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {Math.floor(exercise.duration / 60)}分{exercise.duration % 60}秒
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">收缩时间:</span>
                    <span className="ml-2 font-medium text-gray-900">{exercise.holdTime}秒</span>
                  </div>
                  <div>
                    <span className="text-gray-500">放松时间:</span>
                    <span className="ml-2 font-medium text-gray-900">{exercise.relaxTime}秒</span>
                  </div>
                  <div>
                    <span className="text-gray-500">重复次数:</span>
                    <span className="ml-2 font-medium text-gray-900">{exercise.reps}次</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(exercise.id)}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
