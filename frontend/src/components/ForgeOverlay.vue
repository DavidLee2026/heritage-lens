<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay show">
      <div class="overlay-box">
        <div class="forge-icon">🔥</div>
        <div class="forge-stage">{{ currentStage.stage }}</div>
        <div class="forge-desc">{{ currentDesc }}</div>
        <div class="forge-bar">
          <div class="forge-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="forge-tip-area">
          <div class="forge-timer">⏱ 预计需要 30 秒</div>
          <div class="forge-tip-label">非遗冷知识</div>
          <div class="forge-tip-text">{{ currentTip }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { FORGE_TIPS } from '../data/forgeTips.js'

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
.forge-icon { font-size: 48px; margin-bottom: 12px; animation: pulse 1s ease-in-out infinite; }
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
.forge-stage { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.forge-desc { font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; }
.forge-bar {
  height: 6px;
  background: var(--border-primary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}
.forge-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-gold));
  width: 0%;
  transition: width 0.3s;
}
.forge-tip-area { margin-top: 16px; }
.forge-timer { font-size: 11px; color: var(--text-tertiary); font-weight: 400; margin-bottom: 4px; }
.forge-tip-label { font-size: 12px; color: var(--text-primary); font-weight: 600; margin-bottom: 3px; }
.forge-tip-text { font-size: 13px; color: var(--text-primary); font-weight: 500; line-height: 1.5; }
</style>
