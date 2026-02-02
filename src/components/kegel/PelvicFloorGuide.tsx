/**
 * 盆底肌定位指导组件
 * 使用真实医学解剖图和分步骤指导
 */

import { useState } from 'react'

interface PelvicFloorGuideProps {
  onClose: () => void
}

export default function PelvicFloorGuide({ onClose }: PelvicFloorGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: '方法一：中断尿流法',
      description: '最常用的定位方法',
      icon: '🚽',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-2">步骤说明：</h4>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. 在排尿过程中，尝试突然憋住尿流</li>
              <li>2. 感受哪种肌肉在收缩</li>
              <li>3. 这就是盆底肌的位置</li>
              <li>4. 放松肌肉，继续排尿</li>
            </ol>
          </div>

          {/* 医学解剖图 - 女性 */}
          <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="font-bold text-gray-900">女性盆底解剖图</div>
              <div className="text-xs text-gray-500 mt-1">来自医学教科书</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-inner">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/1116_Muscle_of_the_Female_Perineum.png/600px-1116_Muscle_of_the_Female_Perineum.png"
                alt="女性盆底肌解剖图"
                className="w-full h-auto"
                onError={(e) => {
                  // 图片加载失败时显示备用方案
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="text-center text-xs text-gray-500 mt-2">
                膀胱、尿道、阴道和盆底肌的位置关系
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 rounded-xl p-4">
              <div className="flex items-start gap-2 text-sm text-yellow-800">
                <span>⚠️</span>
                <div>
                  <div className="font-bold">重要提示：</div>
                  <div>此方法仅用于识别肌肉位置，不要在日常生活中频繁练习憋尿，这可能影响膀胱功能！</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '女性盆底肌训练法',
      description: '专为女性设计',
      icon: '👩',
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-bold text-purple-900 mb-2">方法：阴道触诊法</h4>
            <ol className="space-y-2 text-sm text-purple-800">
              <li>1. 清洁双手后，轻轻插入一根手指</li>
              <li>2. 尝试收缩阴道肌肉，夹紧手指</li>
              <li>3. 感受哪些肌肉在收缩</li>
              <li>4. 这就是盆底肌的正确位置</li>
            </ol>
          </div>

          <div className="bg-pink-50 rounded-xl p-4">
            <h4 className="font-bold text-pink-900 mb-2">女性特别注意事项：</h4>
            <ul className="space-y-2 text-sm text-pink-800">
              <li>• 产后女性建议在医生指导下开始训练</li>
              <li>• 剖腹产或顺产需等待6-8周再开始</li>
              <li>• 如有疼痛应立即停止并咨询医生</li>
              <li>• 月经期可以继续温和的训练</li>
            </ul>
          </div>

          {/* 盆底肌位置示意 */}
          <div className="bg-gradient-to-b from-purple-100 to-pink-50 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="font-bold text-gray-900">女性骨盆结构</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-2xl mb-1">🔴</div>
                <div className="text-xs text-gray-700 font-medium">子宫</div>
                <div className="text-xs text-gray-500">受盆底肌支撑</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-2xl mb-1">🟡</div>
                <div className="text-xs text-gray-700 font-medium">膀胱</div>
                <div className="text-xs text-gray-500">储尿器官</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-2xl mb-1">🟤</div>
                <div className="text-xs text-gray-700 font-medium">直肠</div>
                <div className="text-xs text-gray-500">排便通道</div>
              </div>
              <div className="bg-pink-400 rounded-lg p-3 shadow-sm">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-white font-bold">盆底肌</div>
                <div className="text-xs text-pink-100">像吊床支撑器官</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full text-sm">
                <span>📐</span>
                <span>盆底肌形成"吊床"结构，支撑盆腔器官</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '男性盆底肌训练法',
      description: '专为男性设计',
      icon: '👨',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-2">方法：提升睾丸法</h4>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. 站立或躺下，放松全身</li>
              <li>2. 尝试向上提升睾丸和阴茎</li>
              <li>3. 感受会阴部肌肉的收缩</li>
              <li>4. 这就是盆底肌的收缩动作</li>
            </ol>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4">
            <h4 className="font-bold text-indigo-900 mb-2">男性健康益处：</h4>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li>✓ 改善勃起功能和硬度</li>
              <li>✓ 增强控制射精能力</li>
              <li>✓ 预防和改善前列腺健康</li>
              <li>✓ 术后恢复（如前列腺手术后）</li>
            </ul>
          </div>

          {/* 医学解剖图 - 男性 */}
          <div className="bg-gradient-to-b from-blue-100 to-indigo-50 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="font-bold text-gray-900">男性盆底解剖图</div>
              <div className="text-xs text-gray-500 mt-1">来自医学教科书</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-inner">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/1116_Muscle_of_the_Male_Perineum.png/600px-1116_Muscle_of_the_Male_Perineum.png"
                alt="男性盆底肌解剖图"
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="text-center text-xs text-gray-500 mt-2">
                前列腺、膀胱、尿道和盆底肌的位置关系
              </div>
            </div>

            <div className="mt-4 bg-blue-100 rounded-lg p-3 text-center">
              <div className="text-sm text-blue-800">
                <div className="font-bold mb-1">💡 医学提示</div>
                <div>凯格尔训练可帮助改善良性前列腺增生(BPH)症状</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '呼吸技巧与盆底收缩',
      description: '正确的呼吸配合',
      icon: '🌬️',
      content: (
        <div className="space-y-4">
          {/* 呼吸动画演示 */}
          <div className="bg-gradient-to-br from-cyan-100 to-blue-50 rounded-xl p-8">
            <h4 className="font-bold text-center text-gray-900 mb-6">4-7-8 呼吸法动画</h4>

            <div className="flex items-center justify-center gap-8">
              {/* 吸气动画 */}
              <div className="text-center">
                <div className="text-sm font-bold text-blue-600 mb-2">吸气 (4秒)</div>
                <div className="relative w-32 h-32">
                  {/* 圆形呼吸球 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 animate-[breathe-in_4s_ease-in-out_infinite]"
                    ></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <div className="text-xs text-blue-600">鼻子深吸气</div>
                  </div>
                </div>
              </div>

              {/* 呼气/收缩动画 */}
              <div className="text-center">
                <div className="text-sm font-bold text-purple-600 mb-2">保持 (7秒) + 收缩</div>
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 animate-[breathe-hold_7s_ease-in-out_infinite]"
                    ></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <div className="text-xs text-purple-600">憋气 + 收缩盆底肌</div>
                  </div>
                </div>
              </div>

              {/* 呼气动画 */}
              <div className="text-center">
                <div className="text-sm font-bold text-green-600 mb-2">呼气 (8秒)</div>
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-[breathe-out_8s_ease-in-out_infinite]"
                    ></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <div className="text-xs text-green-600">用嘴呼气</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 详细说明 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">🎯 配合要点：</h4>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="font-bold text-blue-600">吸气阶段：</span>
                <span> 用鼻子深吸气4秒，让腹部自然隆起</span>
              </div>
              <div>
                <span className="font-bold text-purple-600">保持阶段：</span>
                <span> 憋气7秒，同时收缩盆底肌（想象憋尿）</span>
              </div>
              <div>
                <span className="font-bold text-green-600">呼气阶段：</span>
                <span> 用嘴缓慢呼气8秒，放松盆底肌</span>
              </div>
            </div>
            <div className="mt-4 bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-sm text-yellow-800">
                <strong>💡 关键：</strong>收缩盆底肌时，腹部、臀部、大腿都保持放松
              </div>
            </div>
          </div>

          {/* 常见错误 */}
          <div className="bg-red-50 rounded-xl p-4">
            <h4 className="font-bold text-red-900 mb-3">❌ 常见错误：</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600">✗</span>
                  <span className="font-bold text-red-700">腹肌用力</span>
                </div>
                <div className="text-xs text-red-600">肚子鼓起来了</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600">✗</span>
                  <span className="font-bold text-red-700">臀肌收缩</span>
                </div>
                <div className="text-xs text-red-600">臀部夹紧了</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600">✗</span>
                  <span className="font-bold text-red-700">大腿用力</span>
                </div>
                <div className="text-xs text-red-600">腿部肌肉参与</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600">✗</span>
                  <span className="font-bold text-red-700">憋气时间过长</span>
                </div>
                <div className="text-xs text-red-600">可能导致头晕</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '如何验证训练正确',
      description: '确认你找到的是盆底肌',
      icon: '✅',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-bold text-green-900 mb-3">✅ 正确训练的标志：</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span><strong>腹部放松：</strong>收缩时肚子不鼓起或收紧</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span><strong>臀部放松：</strong>臀部和大腿不参与用力</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span><strong>呼吸自然：</strong>可以正常说话，不需要憋气</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span><strong>位置正确：</strong>感觉在会阴部（生殖器和肛门之间）</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-3">🎯 自测练习：</h4>
            <div className="text-sm text-blue-800 space-y-3">
              <div><strong>步骤 1：</strong>躺下或站立，放松全身</div>
              <div><strong>步骤 2：</strong>尝试收缩盆底肌，保持5秒</div>
              <div><strong>步骤 3：</strong>完全放松，休息5秒</div>
              <div><strong>步骤 4：</strong>检查上面的"正确训练标志"</div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-blue-700">
                <strong>💪 目标：</strong>每组10次，每天3组
              </div>
            </div>
          </div>

          {/* 呼吸练习 */}
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-bold text-purple-900 mb-3">🌬️ 呼吸练习（重要！）</h4>
            <div className="text-sm text-purple-800">
              <p className="mb-3">配合呼吸的凯格尔训练效果更好：</p>
              <div className="space-y-2">
                <div><strong>1.</strong> 吸气时（4秒）：放松准备</div>
                <div><strong>2.</strong> 呼气保持（7秒）+ 收缩盆底肌：核心训练</div>
                <div><strong>3.</strong> 呼气放松（8秒）：完全放松</div>
              </div>
              <div className="mt-3 bg-white rounded-lg p-3">
                <div className="text-xs text-purple-700">
                  💡 <strong>提示：</strong>可以将手放在腹部，确保呼吸时肚子起伏而不是胸部
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '训练计划与注意事项',
      description: '科学训练指南',
      icon: '📋',
      content: (
        <div className="space-y-4">
          {/* 训练频率 */}
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-bold text-green-900 mb-3">📅 推荐训练频率：</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl mb-1">🌱</div>
                <div className="font-bold text-green-700">第1-2周</div>
                <div className="text-xs text-green-600">每天2-3组</div>
                <div className="text-xs text-gray-500">每组10次</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl mb-1">🌿</div>
                <div className="font-bold text-green-700">第3-4周</div>
                <div className="text-xs text-green-600">每天3-4组</div>
                <div className="text-xs text-gray-500">每组15次</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl mb-1">🌳</div>
                <div className="font-bold text-green-700">第5周+</div>
                <div className="text-xs text-green-600">每天3-4组</div>
                <div className="text-xs text-gray-500">每组20次</div>
              </div>
            </div>
          </div>

          {/* 注意事项 */}
          <div className="bg-yellow-50 rounded-xl p-4">
            <h4 className="font-bold text-yellow-900 mb-3">⚠️ 重要注意事项：</h4>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li>• 如果有严重尿失禁、疼痛或其他症状，请先咨询医生</li>
              <li>训练时感到疼痛应立即停止，不要勉强</li>
              <li>不要在排尿时进行凯格尔训练（仅用于定位）</li>
              <li>保持规律训练，效果需要4-6周才能显现</li>
              <li>训练前排尿，避免膀胱充盈影响训练</li>
              <li>产后女性、手术后患者需遵医嘱</li>
            </ul>
          </div>

          {/* 预期效果 */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-3">🎯 预期效果（坚持6-8周）：</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xl mb-1">💪</div>
                <div className="text-sm font-bold text-blue-700">盆底肌力量增强</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xl mb-1">😴</div>
                <div className="text-sm font-bold text-blue-700">尿失禁改善</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xl mb-1">❤️</div>
                <div className="text-sm font-bold text-blue-700">性功能提升</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xl mb-1">😊</div>
                <div className="text-sm font-bold text-blue-700">整体健康改善</div>
              </div>
            </div>
          </div>

          {/* 医学免责声明 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <h4 className="font-bold text-red-900 mb-3">🏥 医学免责声明：</h4>
            <div className="text-sm text-red-800 space-y-3">
              <p><strong>本应用提供的健康信息仅供参考，不能替代专业医疗建议、诊断或治疗。</strong></p>

              <div className="bg-white rounded-lg p-3">
                <div className="font-bold text-red-700 mb-2">以下情况请先咨询医生：</div>
                <ul className="space-y-1 text-xs">
                  <li>• 孕期或产后恢复期女性</li>
                  <li>• 盆腔手术后恢复期</li>
                  <li>• 严重盆底脏器脱垂</li>
                  <li>• 急性尿路感染或炎症</li>
                  <li>• 严重尿潴留或排尿困难</li>
                  <li>• 盆腔疼痛或原因不明的会阴部疼痛</li>
                  <li>• 严重心肺疾病患者</li>
                  <li>• 前列腺炎急性期</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-3">
                <div className="font-bold text-red-700 mb-2">训练中如出现以下情况应立即停止：</div>
                <ul className="space-y-1 text-xs">
                  <li>• 剧烈疼痛或不适</li>
                  <li>• 阴道异常出血</li>
                  <li>• 头晕、恶心或呼吸困难</li>
                  <li>• 尿失禁症状加重</li>
                  <li>• 盆腔器官脱垂感觉加重</li>
                </ul>
              </div>

              <div className="bg-red-100 rounded-lg p-3 text-center">
                <div className="text-xs">
                  <strong>⚠️ 如有疑虑，请务必咨询专业医师、物理治疗师或妇科/泌尿科医生</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '特殊人群训练指南',
      description: '孕期、产后及术后注意事项',
      icon: '🏥',
      content: (
        <div className="space-y-4">
          {/* 孕期女性 */}
          <div className="bg-pink-50 rounded-xl p-4">
            <h4 className="font-bold text-pink-900 mb-3">🤰 孕期女性：</h4>
            <ul className="space-y-2 text-sm text-pink-800">
              <li>• 咨询产科医生后再开始训练</li>
              <li>• 避免平卧位训练（孕中晚期应侧卧或站立）</li>
              <li>• 如有宫颈机能不全、胎盘前置等并发症需遵医嘱</li>
              <li>• 出现宫缩、出血或腹痛立即停止并就医</li>
            </ul>
          </div>

          {/* 产后女性 */}
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-bold text-purple-900 mb-3">👶 产后女性：</h4>
            <div className="space-y-3 text-sm text-purple-800">
              <div>
                <div className="font-bold mb-1">顺产：</div>
                <ul className="space-y-1 text-xs ml-4">
                  <li>• 无并发症者产后24-48小时可开始温和训练</li>
                  <li>• 会阴侧切或撕裂需等伤口愈合（通常2-3周）</li>
                  <li>• 如有疼痛应立即停止</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-1">剖腹产：</div>
                <ul className="space-y-1 text-xs ml-4">
                  <li>• 通常术后6-8周可开始，需遵医嘱</li>
                  <li>• 等伤口愈合且疼痛减轻后</li>
                  <li>• 避免增加腹压的动作</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 术后患者 */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-3">🏥 术后患者：</h4>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <div className="font-bold mb-1">前列腺手术：</div>
                <ul className="space-y-1 text-xs ml-4">
                  <li>• 术后需遵泌尿外科医生指导</li>
                  <li>• 通常术后1-2周开始温和训练</li>
                  <li>• 有助于恢复尿控功能</li>
                  <li>• 避免过度训练导致疲劳</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-1">妇科手术：</div>
                <ul className="space-y-1 text-xs ml-4">
                  <li>• 子宫切除、盆底修复术后需遵医嘱</li>
                  <li>• 通常术后4-6周开始</li>
                  <li>• 等阴道伤口完全愈合</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 老年人 */}
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-bold text-green-900 mb-3">👵 老年人群：</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• 凯格尔训练对老年性尿失禁同样有效</li>
              <li>• 可从较短的收缩时间开始（3-5秒）</li>
              <li>• 配合其他生活方式调整（减少咖啡因、定时排尿等）</li>
              <li>• 效果可能需要更长时间显现（8-12周）</li>
            </ul>
          </div>

          {/* 重要提醒 */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
            <div className="text-sm text-yellow-900 text-center">
              <strong>💡 重要提醒：</strong>
              <div className="mt-2 text-xs">
                特殊人群的训练方案应根据个人情况在专业医师或物理治疗师指导下制定
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* 头部 - 固定高度 */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-gray-900">如何找到盆底肌</h2>
            <div className="w-6"></div>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  index < currentStep
                    ? 'bg-[#007AFF] text-white'
                    : index === currentStep
                    ? 'bg-[#007AFF] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 内容区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 步骤标题 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{steps[currentStep].icon}</span>
              <h3 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h3>
            </div>
            <p className="text-gray-600 ml-12">{steps[currentStep].description}</p>
          </div>

          {/* 步骤内容 */}
          {steps[currentStep].content}
        </div>

        {/* 底部导航 - 固定高度 */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                ← 上一步
              </button>
            )}
            <button
              onClick={() =>
                currentStep < steps.length - 1
                  ? setCurrentStep(currentStep + 1)
                  : onClose()
              }
              className="flex-1 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              {currentStep < steps.length - 1 ? '下一步 →' : '开始训练'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
