/**
 * 凯格尔训练可视化指导组件
 * 提供呼吸节奏动画、解剖位置提示和训练指导
 */

import { useState } from 'react'
import PelvicFloorGuide from './PelvicFloorGuide'

interface KegelGuideProps {
  isHolding?: boolean
  timeRemaining?: number
  level: 'beginner' | 'intermediate' | 'advanced'
  showGuide: boolean
  onToggleGuide: () => void
  isTraining?: boolean
}

export default function KegelGuide({ isHolding = false, timeRemaining = 0, level, showGuide, onToggleGuide, isTraining = false }: KegelGuideProps) {
  const [guideTab, setGuideTab] = useState<'animation' | 'anatomy' | 'tips' | 'locator'>('locator')
  const [showPelvicFloorGuide, setShowPelvicFloorGuide] = useState(false)
  const [anatomyTab, setAnatomyTab] = useState<'female' | 'male'>('female')

  // 等级说明
  const levelInfo = {
    beginner: {
      name: '初级',
      description: '适合初学者，建立基础',
      target: '每天3组，每组10次',
      holdTime: '3秒',
      relaxTime: '3秒',
      who: '• 从未进行过盆底肌训练\n• 产后恢复初期\n• 有轻微尿失禁问题\n• 年龄较大或体能较弱',
    },
    intermediate: {
      name: '中级',
      description: '有一定基础，增加强度',
      target: '每天3-4组，每组12-15次',
      holdTime: '5秒',
      relaxTime: '5秒',
      who: '• 完成初级训练2-4周\n• 能够正确控制盆底肌\n• 初级训练感到轻松\n• 需要进一步增强力量',
    },
    advanced: {
      name: '高级',
      description: '挑战自我，最大强度',
      target: '每天4-5组，每组20次',
      holdTime: '10秒',
      relaxTime: '5秒',
      who: '• 完成中级训练4-6周\n• 盆底肌力量明显增强\n• 中级训练感到轻松\n• 需要维持高水平',
    },
  }

  const currentLevel = levelInfo[level]

  if (!showGuide) {
    return (
      <button
        onClick={onToggleGuide}
        className="fixed bottom-24 right-4 z-40 bg-[#007AFF] text-white p-3 rounded-full shadow-lg"
      >
        <span className="text-2xl">📖</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* 头部 */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">训练指导</h2>
            <button
              onClick={onToggleGuide}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Tab切换 */}
          <div className="flex mt-4 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setGuideTab('locator')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                guideTab === 'locator' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
              }`}
            >
              🎯 定位
            </button>
            <button
              onClick={() => setGuideTab('animation')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                guideTab === 'animation' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
              }`}
            >
              🎬 动画
            </button>
            <button
              onClick={() => setGuideTab('anatomy')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                guideTab === 'anatomy' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
              }`}
            >
              🏥 解剖
            </button>
            <button
              onClick={() => setGuideTab('tips')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                guideTab === 'tips' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
              }`}
            >
              💡 等级
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 定位盆底肌 */}
          {guideTab === 'locator' && (
            <div className="space-y-6">
              <div className="ios-card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">如何找到盆底肌？</h3>
                    <p className="text-sm opacity-90">详细的分步骤指导</p>
                  </div>
                  <span className="text-4xl">🎯</span>
                </div>
              </div>

              {/* 医学解剖图 - 移到最前面 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🏥 盆底肌解剖图</h3>

                {/* 标签切换 */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                  <button
                    onClick={() => setAnatomyTab('female')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      anatomyTab === 'female' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    👩 女性
                  </button>
                  <button
                    onClick={() => setAnatomyTab('male')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      anatomyTab === 'male' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    👨 男性
                  </button>
                </div>

                {/* 女性解剖图 */}
                {anatomyTab === 'female' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-b from-pink-100 to-purple-50 rounded-xl p-4">
                      <div className="text-center mb-3">
                        <div className="font-bold text-gray-900">女性盆底解剖结构</div>
                        <div className="text-xs text-gray-500 mt-1">来自医学教科书（Cunningham's Anatomy）</div>
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-inner">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/1116_Muscle_of_the_Female_Perineum.png/600px-1116_Muscle_of_the_Female_Perineum.png"
                          alt="女性盆底肌解剖图"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>

                      <div className="mt-3 bg-pink-50 rounded-lg p-3">
                        <div className="text-xs text-pink-800 space-y-1">
                          <div className="font-bold mb-2">📌 关键结构：</div>
                          <div>• <strong>盆底肌</strong>：像吊床一样支撑膀胱、子宫和直肠</div>
                          <div>• <strong>尿道</strong>：控制排尿的通道</div>
                          <div>• <strong>阴道</strong>：盆底肌围绕阴道</div>
                          <div>• <strong>肛门</strong>：后方出口</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-800">
                        <div className="font-bold mb-1">💡 训练要点：</div>
                        收缩时想象用阴道肌肉夹紧手指，同时控制排尿和排气
                      </div>
                    </div>
                  </div>
                )}

                {/* 男性解剖图 */}
                {anatomyTab === 'male' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-b from-blue-100 to-indigo-50 rounded-xl p-4">
                      <div className="text-center mb-3">
                        <div className="font-bold text-gray-900">男性盆底解剖结构</div>
                        <div className="text-xs text-gray-500 mt-1">来自医学教科书（Cunningham's Anatomy）</div>
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-inner">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/1116_Muscle_of_the_Male_Perineum.png/600px-1116_Muscle_of_the_Male_Perineum.png"
                          alt="男性盆底肌解剖图"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>

                      <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-800 space-y-1">
                          <div className="font-bold mb-2">📌 关键结构：</div>
                          <div>• <strong>盆底肌</strong>：支撑膀胱和前列腺</div>
                          <div>• <strong>前列腺</strong>：位于盆底肌上方</div>
                          <div>• <strong>尿道</strong>：穿过盆底肌</div>
                          <div>• <strong>肛门</strong>：后方出口</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-3">
                      <div className="text-xs text-indigo-800">
                        <div className="font-bold mb-1">💡 训练要点：</div>
                        收缩时尝试提升睾丸，同时控制排尿和排气
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 快速方法 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ 快速定位方法</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                    <span className="text-2xl">🚽</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">中断尿流法</div>
                      <div className="text-sm text-gray-600 mt-1">
                        在排尿时突然憋住尿流，感受收缩的肌肉位置
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                    <span className="text-2xl">💨</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">憋住屁法</div>
                      <div className="text-sm text-gray-600 mt-1">
                        想象憋住屁，收缩肛门周围的肌肉
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-3 mt-4">
                  <div className="text-xs text-yellow-800">
                    ⚠️ <strong>注意：</strong>这些方法仅用于识别肌肉，不要在日常生活中频繁练习憋尿！
                  </div>
                </div>
              </div>

              {/* 分性别指导 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">👤 分性别指导</h3>

                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">👩</span>
                      <span className="font-bold text-purple-900">女性方法</span>
                    </div>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• 阴道收缩法：用阴道肌肉夹紧手指</li>
                      <li>• 卫生棉条法：用肌肉固定住棉条</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">👨</span>
                      <span className="font-bold text-blue-900">男性方法</span>
                    </div>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 提升睾丸法：尝试提升睾丸和阴茎</li>
                      <li>• 控制跳动法：让勃起的阴茎跳动</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 医学解剖图 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🏥 盆底肌解剖图</h3>

                {/* 标签切换 */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                  <button
                    onClick={() => setAnatomyTab('female')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      anatomyTab === 'female' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    👩 女性
                  </button>
                  <button
                    onClick={() => setAnatomyTab('male')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      anatomyTab === 'male' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    👨 男性
                  </button>
                </div>

                {/* 女性解剖图 */}
                {anatomyTab === 'female' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-b from-pink-100 to-purple-50 rounded-xl p-4">
                      <div className="text-center mb-3">
                        <div className="font-bold text-gray-900">女性盆底解剖结构</div>
                        <div className="text-xs text-gray-500 mt-1">来自医学教科书（Cunningham's Anatomy）</div>
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-inner">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/1116_Muscle_of_the_Female_Perineum.png/600px-1116_Muscle_of_the_Female_Perineum.png"
                          alt="女性盆底肌解剖图"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>

                      <div className="mt-3 bg-pink-50 rounded-lg p-3">
                        <div className="text-xs text-pink-800 space-y-1">
                          <div className="font-bold mb-2">📌 关键结构：</div>
                          <div>• <strong>盆底肌</strong>：像吊床一样支撑膀胱、子宫和直肠</div>
                          <div>• <strong>尿道</strong>：控制排尿的通道</div>
                          <div>• <strong>阴道</strong>：盆底肌围绕阴道</div>
                          <div>• <strong>肛门</strong>：后方出口</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-800">
                        <div className="font-bold mb-1">💡 训练要点：</div>
                        收缩时想象用阴道肌肉夹紧手指，同时控制排尿和排气
                      </div>
                    </div>
                  </div>
                )}

                {/* 男性解剖图 */}
                {anatomyTab === 'male' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-b from-blue-100 to-indigo-50 rounded-xl p-4">
                      <div className="text-center mb-3">
                        <div className="font-bold text-gray-900">男性盆底解剖结构</div>
                        <div className="text-xs text-gray-500 mt-1">来自医学教科书（Cunningham's Anatomy）</div>
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-inner">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/1116_Muscle_of_the_Male_Perineum.png/600px-1116_Muscle_of_the_Male_Perineum.png"
                          alt="男性盆底肌解剖图"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>

                      <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-800 space-y-1">
                          <div className="font-bold mb-2">📌 关键结构：</div>
                          <div>• <strong>盆底肌</strong>：支撑膀胱和前列腺</div>
                          <div>• <strong>前列腺</strong>：位于盆底肌上方</div>
                          <div>• <strong>尿道</strong>：穿过盆底肌</div>
                          <div>• <strong>肛门</strong>：后方出口</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-3">
                      <div className="text-xs text-indigo-800">
                        <div className="font-bold mb-1">💡 训练要点：</div>
                        收缩时尝试提升睾丸，同时控制排尿和排气
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 验证是否正确 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">✅ 如何验证是否正确</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-sm text-green-800">
                      <div className="font-bold">腹部放松</div>
                      <div className="text-xs">肚子不鼓起</div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-sm text-green-800">
                      <div className="font-bold">臀部放松</div>
                      <div className="text-xs">臀部不夹紧</div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-sm text-green-800">
                      <div className="font-bold">呼吸正常</div>
                      <div className="text-xs">能正常说话</div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-sm text-green-800">
                      <div className="font-bold">位置正确</div>
                      <div className="text-xs">会阴部有感觉</div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-3 mt-4">
                  <div className="text-xs text-red-800">
                    ❌ <strong>错误：</strong>肚子鼓起、臀部夹紧、憋气、大腿用力
                  </div>
                </div>
              </div>

              {/* 体验按钮 */}
              <button
                onClick={() => setShowPelvicFloorGuide(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
              >
                📖 查看详细图文指导
              </button>

              {/* 医学资源 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🌐 医学参考资源</h3>

                <div className="space-y-2 text-sm">
                  <a
                    href="https://zh.wikipedia.org/wiki/%E5%87%AF%E6%A0%BC%E5%B0%94%E8%BF%90%E5%8A%A8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>📚</span>
                      <span className="text-blue-700">维基百科 - 凯格尔运动</span>
                      <span className="ml-auto text-blue-500">→</span>
                    </div>
                  </a>

                  <a
                    href="https://en.wikipedia.org/wiki/Pelvic_floor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🦴</span>
                      <span className="text-purple-700">Wikipedia - Pelvic Floor Anatomy</span>
                      <span className="ml-auto text-purple-500">→</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}

          {guideTab === 'animation' && (
            <div className="space-y-6">
              {!isTraining && (
                <div className="ios-card bg-blue-50">
                  <div className="text-sm text-blue-800">
                    💡 开始训练后，这里会显示实时的呼吸节奏动画
                  </div>
                </div>
              )}

              {/* 呼吸节奏动画 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {isTraining ? '呼吸节奏' : '呼吸节奏示例'}
                </h3>

                <div className="relative w-48 h-48 mx-auto">
                  {/* 外圈 - 呼吸提示 */}
                  <div
                    className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
                      isHolding ? 'border-red-500 scale-100' : 'border-green-500 scale-75'
                    }`}
                  />

                  {/* 中圈 - 当前状态 */}
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-5xl font-bold">{isTraining ? timeRemaining : '3'}</div>
                      <div className="text-sm mt-2">
                        {isHolding ? '⬆️ 收缩' : '⬇️ 放松'}
                      </div>
                    </div>
                  </div>

                  {/* 箭头指示 */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
                      isHolding ? 'scale-110' : 'scale-90'
                    }`}
                  >
                    {isHolding ? (
                      <div className="text-4xl animate-pulse">⬆️</div>
                    ) : (
                      <div className="text-4xl">⬇️</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-lg font-medium text-gray-900">
                    {isHolding ? '收缩盆底肌' : '放松肌肉'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {isHolding ? '想象憋尿的感觉' : '完全放松，休息'}
                  </p>
                </div>
              </div>

              {/* 动作说明 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">动作要领</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">⬆️</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">收缩盆底肌</div>
                      <div className="text-sm text-gray-600 mt-1">
                        想象憋住尿的感觉，收紧并提升盆底肌肉
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🌬️</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">保持呼吸</div>
                      <div className="text-sm text-gray-600 mt-1">
                        正常呼吸，不要憋气，数出声帮助保持
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">⬇️</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">放松肌肉</div>
                      <div className="text-sm text-gray-600 mt-1">
                        完全放松盆底肌，让肌肉恢复，休息与收缩时间相同
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 解剖指导 */}
          {guideTab === 'anatomy' && (
            <div className="space-y-6">
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">盆底肌解剖结构</h3>

                {/* 性别切换 */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                  <button
                    onClick={() => setAnatomyTab('female')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      anatomyTab === 'female' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    👩 女性
                  </button>
                  <button
                    onClick={() => setAnatomyTab('male')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      anatomyTab === 'male' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    👨 男性
                  </button>
                </div>

                {/* 女性解剖图 */}
                {anatomyTab === 'female' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-b from-pink-100 to-purple-50 rounded-xl p-4">
                      <div className="text-center mb-3">
                        <div className="font-bold text-gray-900">女性盆底解剖结构</div>
                        <div className="text-xs text-gray-500 mt-1">来自医学教科书（Cunningham's Anatomy）</div>
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-inner">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/1116_Muscle_of_the_Female_Perineum.png/600px-1116_Muscle_of_the_Female_Perineum.png"
                          alt="女性盆底肌解剖图"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>

                      <div className="mt-3 bg-pink-50 rounded-lg p-3">
                        <div className="text-xs text-pink-800 space-y-1">
                          <div className="font-bold mb-2">📌 关键结构：</div>
                          <div>• <strong>盆底肌</strong>：像吊床一样支撑膀胱、子宫和直肠</div>
                          <div>• <strong>尿道</strong>：控制排尿的通道</div>
                          <div>• <strong>阴道</strong>：盆底肌围绕阴道</div>
                          <div>• <strong>肛门</strong>：后方出口</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="mb-2">
                        <strong className="text-gray-900">如何找到盆底肌：</strong>
                      </p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li>小便时突然憋住，感受收缩的肌肉</li>
                        <li>想象憋住屁的感觉</li>
                        <li>收缩阴道肌肉，用肌肉夹紧手指</li>
                      </ul>

                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ 注意：不要在排尿过程中频繁练习凯格尔，这可能影响膀胱功能。仅在识别肌肉时使用一次。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 男性解剖图 */}
                {anatomyTab === 'male' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-b from-blue-100 to-indigo-50 rounded-xl p-4">
                      <div className="text-center mb-3">
                        <div className="font-bold text-gray-900">男性盆底解剖结构</div>
                        <div className="text-xs text-gray-500 mt-1">来自医学教科书（Cunningham's Anatomy）</div>
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-inner">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/1116_Muscle_of_the_Male_Perineum.png/600px-1116_Muscle_of_the_Male_Perineum.png"
                          alt="男性盆底肌解剖图"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>

                      <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-800 space-y-1">
                          <div className="font-bold mb-2">📌 关键结构：</div>
                          <div>• <strong>盆底肌</strong>：支撑膀胱和前列腺</div>
                          <div>• <strong>前列腺</strong>：位于盆底肌上方</div>
                          <div>• <strong>尿道</strong>：穿过盆底肌</div>
                          <div>• <strong>肛门</strong>：后方出口</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="mb-2">
                        <strong className="text-gray-900">如何找到盆底肌：</strong>
                      </p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li>小便时突然憋住，感受收缩的肌肉</li>
                        <li>想象憋住屁的感觉</li>
                        <li>提升睾丸的肌肉</li>
                        <li>让勃起的阴茎跳动</li>
                      </ul>

                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ 注意：不要在排尿过程中频繁练习凯格尔，这可能影响膀胱功能。仅在识别肌肉时使用一次。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 等级说明 */}
          {guideTab === 'tips' && (
            <div className="space-y-6">
              {/* 当前等级卡片 */}
              <div className="ios-card bg-blue-50">
                <h3 className="text-lg font-bold text-gray-900 mb-2">当前等级：{currentLevel.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{currentLevel.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">收缩时长：</span>
                    <span className="font-bold text-gray-900">{currentLevel.holdTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">放松时长：</span>
                    <span className="font-bold text-gray-900">{currentLevel.relaxTime}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">🎯 训练目标</div>
                  <div className="text-sm text-blue-800 mt-1">{currentLevel.target}</div>
                </div>
              </div>

              {/* 适合人群 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">适合人群</h3>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {currentLevel.who}
                </div>
              </div>

              {/* 所有等级对比 */}
              <div className="ios-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">等级对比</h3>

                <div className="space-y-3">
                  {/* 初级 */}
                  <div className="border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-green-700">🌱 初级</div>
                      <div className="text-xs text-green-600">基础建立</div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>• 收缩3秒，放松3秒</div>
                      <div>• 每组10次，每天3组</div>
                      <div>• 总时长约10分钟</div>
                    </div>
                  </div>

                  {/* 中级 */}
                  <div className="border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-blue-700">💪 中级</div>
                      <div className="text-xs text-blue-600">强度增加</div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>• 收缩5秒，放松5秒</div>
                      <div>• 每组15次，每天3-4组</div>
                      <div>• 总时长约15-20分钟</div>
                    </div>
                  </div>

                  {/* 高级 */}
                  <div className="border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-red-700">🔥 高级</div>
                      <div className="text-xs text-red-600">最大强度</div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>• 收缩10秒，放松5秒</div>
                      <div>• 每组20次，每天4-5组</div>
                      <div>• 总时长约25-30分钟</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 进阶建议 */}
              <div className="ios-card bg-gradient-to-r from-green-50 to-blue-50">
                <h3 className="text-lg font-bold text-gray-900 mb-3">📈 进阶建议</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• <strong>初级→中级：</strong>完成2-4周初级训练，能轻松完成所有组数</p>
                  <p>• <strong>中级→高级：</strong>完成4-6周中级训练，盆底肌力量明显增强</p>
                  <p>• 每周评估一次，如果当前等级感到轻松且无不适，可考虑进阶</p>
                </div>
              </div>

              {/* 注意事项 */}
              <div className="ios-card bg-yellow-50">
                <h3 className="text-lg font-bold text-gray-900 mb-3">⚠️ 注意事项</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• 保持正常呼吸，不要憋气</p>
                  <p>• 只收缩盆底肌，不要收紧大腿、臀部或腹部</p>
                  <p>• 如果感到疼痛或不适，立即停止并咨询医生</p>
                  <p>• 产后女性应在医生指导下进行</p>
                  <p>• 坚持比强度更重要，养成每日习惯</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 盆底肌定位详细指导 */}
      {showPelvicFloorGuide && (
        <PelvicFloorGuide onClose={() => setShowPelvicFloorGuide(false)} />
      )}
    </div>
  )
}
