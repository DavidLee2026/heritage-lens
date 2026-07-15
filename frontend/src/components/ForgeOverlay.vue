<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay show">
      <div class="overlay-box">
        <div class="forge-icon">
          <span class="forge-emoji">{{ styleEmoji }}</span>
        </div>
        <div class="forge-stage">{{ currentStage.stage }}</div>
        <div class="forge-desc">
          {{ styleName }}<template v-if="styleName && currentDesc"> · </template>{{ currentDesc }}
        </div>
        <div class="forge-bar">
          <div class="forge-fill" :style="{ width: progress + '%' }">
            <div class="forge-shimmer"></div>
          </div>
        </div>
        <div class="forge-pct">{{ Math.round(progress) }}%</div>
        <div class="forge-tip-area">
          <div class="forge-tip-label">📖 非遗冷知识</div>
          <transition name="tip-fade" mode="out-in">
            <div class="forge-tip-text" :key="tipIdx">{{ currentTip }}</div>
          </transition>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { FORGE_TIPS } from '../data/forgeTips.js'
import { getStyleById } from '../data/styles.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  styleId: { type: String, default: 'miao_silver' },
  apiDone: { type: Boolean, default: false },
})

const emit = defineEmits(['complete'])

const STAGES = [
  { stage: '🔥 灵感熔炼', desc: '正在识别人物轮廓与姿态...', pct: 0 },
  { stage: '🔨 匠心塑造', desc: '正在构思非遗元素与服饰搭配...', pct: 15 },
  { stage: '🎨 纹样雕琢', desc: '正在绘制传统纹样与工艺细节...', pct: 30 },
  { stage: '✨ 质感编织', desc: '正在打磨光影质感与色彩层次...', pct: 50 },
  { stage: '🔥 美学淬火', desc: '正在精细渲染细节，已经过半了...', pct: 70 },
  { stage: '🌐 渲染合成', desc: '匠心淬炼中，即将完成...', pct: 90 },
]

const progress = ref(0)
const tipIdx = ref(0)
const customDesc = ref('')
const waitingForApi = ref(false)
let timer = null
let tipCounter = 0
let stallCount = 0

const allTips = computed(() => {
  const styleTips = FORGE_TIPS[props.styleId] || []
  return [...styleTips, ...FORGE_TIPS.generic]
})

const currentTip = computed(() => allTips.value[tipIdx.value] || FORGE_TIPS.generic[0])

const currentDesc = computed(() => customDesc.value || currentStageDesc.value)

const styleData = computed(() => getStyleById(props.styleId))
const styleName = computed(() => styleData.value?.name || '')
const styleEmoji = computed(() => styleData.value?.emoji || '🔥')

const currentStageDesc = computed(() => {
  let last = STAGES[0]
  for (const s of STAGES) {
    if (progress.value >= s.pct) last = s
  }
  return last.desc
})

const currentStage = computed(() => {
  let last = STAGES[0]
  for (const s of STAGES) {
    if (progress.value >= s.pct) last = s
  }
  return last
})

watch(
  () => props.visible,
  (v) => {
    if (v) startForge()
    else stopForge()
  }
)

function startForge() {
  stopForge()
  progress.value = 0
  tipIdx.value = 0
  tipCounter = 0
  stallCount = 0
  customDesc.value = ''
  waitingForApi.value = false

  // 30 秒总时长：0-70% ~16s, 70-90% ~8s, 90-97% ~3s, 97%等API, 收尾~2s
  timer = setInterval(() => {
    if (progress.value < 70) {
      progress.value += Math.random() * 1.2 + 0.3
    } else if (progress.value < 90) {
      progress.value += Math.random() * 0.6 + 0.2
    } else if (progress.value < 97) {
      progress.value += Math.random() * 0.2 + 0.04
    } else if (waitingForApi.value) {
      // 97% 停顿——等 API 返回
      // 进度条不动，但冷知识继续轮换
    } else {
      // 97% → 100% 收尾
      progress.value += Math.random() * 0.5 + 0.15
    }

    // 到达 97% 且 API 还没完成 → 进入等待态
    if (progress.value >= 97 && !props.apiDone && !waitingForApi.value) {
      waitingForApi.value = true
      customDesc.value = '正在等待 AI 服务器返回结果...'
    }

    if (progress.value > 100) progress.value = 100

    tipCounter++
    if (tipCounter % 20 === 0 && allTips.value.length > 0) {
      tipIdx.value = (tipIdx.value + 1) % allTips.value.length
    }

    if (progress.value >= 100) {
      stopForge()
      emit('complete')
    }
  }, 200)
}

watch(
  () => props.apiDone,
  (done) => {
    if (done && waitingForApi.value) {
      // API 返回了，继续推进
      waitingForApi.value = false
      customDesc.value = 'AI 渲染完成，正在做最后的调优 ✨'
    }
  }
)

function stopForge() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onUnmounted(() => stopForge())
</script>

<style scoped>
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.overlay.show { display: flex; }
.overlay-box {
  background: var(--bg-elevated);
  border-radius: 14px;
  padding: 24px;
  width: 100%;
  max-width: 360px;
  text-align: center;
}
.forge-icon { font-size: 42px; margin-bottom: 8px; }
.forge-emoji { display: inline-block; animation: forgePulse 1.2s ease-in-out infinite; }
@keyframes forgePulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-3deg); }
  75% { transform: scale(1.1) rotate(3deg); }
}
.forge-stage { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.forge-desc { font-size: 12px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.4; }
.forge-bar {
  height: 8px;
  background: var(--border-primary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
  position: relative;
}
.forge-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-gold));
  width: 0%;
  transition: width 0.3s;
  position: relative;
  overflow: hidden;
}
.forge-shimmer {
  position: absolute;
  top: 0;
  left: -30%;
  width: 30%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
  animation: shimmer 2s ease-in-out infinite;
}
@keyframes shimmer {
  0% { left: -30%; }
  100% { left: 100%; }
}
.forge-pct {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 500;
  text-align: right;
  margin-bottom: 8px;
}
.forge-tip-area {
  margin-top: 12px;
  padding: 10px;
  background: var(--bg-primary);
  border-radius: 8px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.forge-tip-label { font-size: 11px; color: var(--text-tertiary); font-weight: 500; margin-bottom: 4px; }
.forge-tip-text { font-size: 13px; color: var(--text-primary); font-weight: 500; line-height: 1.5; }

/* 提示文字淡入淡出过渡 */
.tip-fade-enter-active, .tip-fade-leave-active {
  transition: all 250ms ease;
}
.tip-fade-enter-from { opacity: 0; transform: translateY(6px); }
.tip-fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
