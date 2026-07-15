<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay show">
      <div class="overlay-box">
        <!-- 右上角按钮 -->
        <template v-if="!isFreshResult || hasRevealed">
          <button class="overlay-close" @click="$emit('close')">✕</button>
          <button class="overlay-share" @click="shareCard" :disabled="submitting">📤</button>
        </template>
        <button v-else class="overlay-close" disabled style="visibility:hidden">✕</button>

        <!-- 卡牌场景 -->
        <div class="card-scene" :class="{ 'card-reveal': justRevealed }">
          <div
            class="tilt-wrapper"
            ref="tiltRef"
            @mousemove="onTiltMove"
            @mouseenter="tiltActive = true"
            @mouseleave="onTiltLeave"
            @click="flipCard"
          >
            <div class="flip-box" :class="[rarityClass, { flipped: isFlipped }]">
              <!-- ========== 正面 ========== -->
              <div class="flip-face face-front" :class="rarityClass">
                <div class="paper-texture"></div>
                <div class="rarity-bar" :class="rarityClass">
                  <span class="rarity-label" v-html="rarityLabelHtml"></span>
                  <span class="style-emoji">{{ styleEmoji }}</span>
                </div>
                <div class="card-img">
                  <div class="quality-glow" :class="rarityClass"></div>
                  <img v-if="cardImage" :src="cardImage" class="card-real-img" alt="生成作品" />
                  <span v-else class="card-placeholder">🏮</span>
                  <!-- 共鸣四识气泡 -->
                  <div class="bubble-row">
                    <div class="bubble-col left">
                      <div
                        v-for="dim in leftDims"
                        :key="dim.idx"
                        class="bubble-wrap"
                        :data-dim="dim.idx"
                        @mouseenter="showBubbleTip($event, dim.idx)"
                        @mouseleave="hideBubbleTip"
                        @click.stop
                      >
                        <div
                          class="bubble"
                          :class="[bubbleClass(dim.idx), { 'pop-in': bubblesVisible }]"
                          :style="{ animationDelay: dim.delay + 'ms' }"
                        >
                          <span class="b-icon">{{ dim.icon }}</span>{{ dim.label }}
                        </div>
                      </div>
                    </div>
                    <div class="bubble-col right">
                      <div
                        v-for="dim in rightDims"
                        :key="dim.idx"
                        class="bubble-wrap"
                        :data-dim="dim.idx"
                        @mouseenter="showBubbleTip($event, dim.idx)"
                        @mouseleave="hideBubbleTip"
                        @click.stop
                      >
                        <div
                          class="bubble"
                          :class="[bubbleClass(dim.idx), { 'pop-in': bubblesVisible }]"
                          :style="{ animationDelay: dim.delay + 'ms' }"
                        >
                          <span class="b-icon">{{ dim.icon }}</span>{{ dim.label }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <span class="card-style-name">{{ cardStyleLabel }}</span>
                  <span class="card-resonance">共鸣 Lv.{{ resonanceLevel }}</span>
                </div>
              </div>

              <!-- ========== 背面：未揭晓时显示"？"封面，揭晓后显示文化信息 ========== -->
              <div class="flip-face face-back" :class="rarityClass">
                <div class="paper-texture"></div>
                <div class="silver-ornament">
                  <template v-if="rarityClass === 'shenpin'"><div></div><div></div></template>
                </div>

                <!-- 问号封面（盲盒效果） -->
                <div v-if="!hasRevealed" class="mystery-cover">
                  <div class="mystery-question">?</div>
                  <div class="mystery-hint">点击揭晓</div>
                </div>

                <!-- 揭晓后：文化信息 -->
                <template v-else>
                  <div class="back-seal"><span>非</span><span>遗</span></div>
                  <span class="back-rarity" :class="rarityClass">{{ backContent.rarity }}</span>
                  <div class="back-banner" v-if="bannerImage">
                    <img :src="bannerImage" class="banner-img" />
                  </div>
                  <div class="back-title" v-text="backContent.title"></div>
                  <div class="back-desc" v-text="backContent.desc"></div>
                  <div class="back-source" v-text="backContent.source"></div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 气泡全局 tooltip -->
        <div
          class="bubble-tip-global"
          :class="{ show: tooltipVisible }"
          :style="tooltipStyle"
          v-text="tooltipText"
        ></div>

        <div class="card-hint">{{ hintText }}</div>

        <!-- 提示词 -->
        <div v-if="store.currentResult?.prompt" class="prompt-display">
          <span class="prompt-label">📝 提示词：</span>
          <span class="prompt-text">{{ store.currentResult.prompt }}</span>
        </div>

        <!-- 生成结果操作（揭晓后显示） -->
        <div v-if="isFreshResult && hasRevealed" class="result-actions">
          <button :disabled="submitting" @click="downloadCard">💾 下载</button>
          <button :disabled="submitting" @click="handleCollect">🏛️ 收入图鉴</button>
          <button class="primary" :disabled="submitting" @click="handleRegen">🔄 再来一次</button>
        </div>

        <!-- 图鉴查看操作 -->
        <div v-else-if="!isFreshResult" class="result-actions">
          <button :disabled="submitting" @click="downloadCard">💾 下载</button>
          <button :disabled="submitting" @click="deleteCard">🗑️ 删除</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- 分享海报弹窗 -->
  <SharePoster
    :visible="showPoster"
    :image="cardImage || ''"
    :style-name="styleName"
    :style-id="store.currentResult?.style || store.selectedStyle"
    :rarity="store.currentResult?.rarity || 0"
    :resonance-level="store.getStyleResonance(store.currentResult?.style || store.selectedStyle).level"
    @close="showPoster = false"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import { getStyleById } from '../data/styles.js'
import { KNOWLEDGE } from '../data/knowledge.js'
import SharePoster from './SharePoster.vue'
import {
  RARITY_NAMES,
  RARITY_CLASS,
  RARITY_ABBR,
  RARITY_COLORS,
  BUBBLE_DIMS,
  BUBBLE_ICONS,
} from '../data/constants.js'

const store = useGameStore()

const props = defineProps({
  visible: { type: Boolean, default: false },
  /** 是否是新生成的结果（显示收藏/再来一次 vs 下载/分享/返回） */
  isFreshResult: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },  // 🛡️ 连击锁
})

const emit = defineEmits(['close', 'collect', 'regen'])

/* ========== 状态 ========== */
const tiltRef = ref(null)
const isFlipped = ref(false)
const tiltActive = ref(false)
const justRevealed = ref(false)
const bubblesVisible = ref(false)
const tooltipVisible = ref(false)
const tooltipText = ref('')
const tooltipStyle = ref({})
const showPoster = ref(false)
const hasRevealed = ref(false)   // false=显示"？"封面，true=显示文化信息
let tiltAnimFrame = null

/* ========== 计算属性 ========== */
const result = computed(() => store.currentResult)
const rarityIdx = computed(() => result.value?.rarity ?? 0)
const rarityClass = computed(() => RARITY_CLASS[rarityIdx.value])
const styleData = computed(() => getStyleById(result.value?.style || store.selectedStyle))
const styleEmoji = computed(() => styleData.value?.emoji || '🏮')
const cardImage = computed(() => {
  if (!result.value?.image) return null
  const img = result.value.image
  return img.startsWith('data:') ? img : `data:image/png;base64,${img}`
})
const cardStyleLabel = computed(() => {
  if (!styleData.value) return ''
  return `${styleData.value.name} · ${styleData.value.heritage}`
})

/** 背面窄 banner 图片映射 */
const BANNER_IMG = {
  miao_silver: '/images/苗族_古典_横版.jpg',
  court_dress: '/images/清宫华服_古典_横版.jpg',
  dunhuang: '/images/敦煌_艺术_横版.jpg',
  tang_dynasty: '/images/大唐服饰_古典_横版.jpg',
  ming_brocade: '/images/大明风华_古典_横版.jpg',
  su_embroidery: '/images/苏州刺绣_古典_横版.jpg',
  batik: '/images/蜡染蓝韵_古典_横版.jpg',
  blue_porcelain: '/images/青花瓷纹_古典_横版.jpg',
  yi_costume: '/images/彝族服饰_古典_横版.jpg',
  tibetan: '/images/藏族文化_古典_横版.jpg',
  zhuang_brocade: '/images/壮族壮锦_古典_横版.jpg',
  ming_style: '/images/明式风格_古典_横版.jpg',
}
const bannerImage = computed(() => {
  const sid = result.value?.style || store.selectedStyle
  return BANNER_IMG[sid] || ''
})
const resonanceLevel = computed(() => {
  const reso = store.getStyleResonance(result.value?.style || store.selectedStyle)
  return reso.level
})

const rarityLabelHtml = computed(() => {
  const name = RARITY_NAMES[rarityIdx.value] || '清赏 ✦'
  return rarityIdx.value === 2 ? `<span class="star">${name}</span>` : name
})

const backContent = computed(() => {
  if (!styleData.value) return { rarity: '', title: '', desc: '', source: '' }
  const c = styleData.value.culture[RARITY_CLASS[rarityIdx.value]]
  return c || styleData.value.culture.qingshang
})

const hintText = computed(() => {
  if (!hasRevealed.value) return '✨ 点击卡牌揭晓'
  return isFlipped.value ? '🔄 点击翻转查看正面' : '🔄 点击翻转查看背面'
})

const leftDims = [
  { idx: 0, icon: BUBBLE_ICONS[0], label: BUBBLE_DIMS[0], delay: 0 },
  { idx: 1, icon: BUBBLE_ICONS[1], label: BUBBLE_DIMS[1], delay: 100 },
]
const rightDims = [
  { idx: 2, icon: BUBBLE_ICONS[2], label: BUBBLE_DIMS[2], delay: 200 },
  { idx: 3, icon: BUBBLE_ICONS[3], label: BUBBLE_DIMS[3], delay: 300 },
]

function bubbleClass(dimIdx) {
  const level = resonanceLevel.value
  if (level >= 5) return 'maxed'       // Lv.5: 全部满级
  if (level >= 4 && dimIdx === 3) return 'maxed' // Lv.4: 寓意(第4识)辉光
  if (level >= dimIdx) return 'unlocked' // Lv.0→纹样, Lv.1→+工艺, 等
  return 'locked'
}

/* ========== 卡牌交互 ========== */
let flipAnimating = false

/**
 * JS 驱动的卡牌翻转（不依赖 CSS backface-visibility，绕过 iOS WebKit bug）
 */
function flipCard() {
  if (flipAnimating) return
  const box = tiltRef.value?.querySelector('.flip-box')
  const front = box?.querySelector('.face-front')
  const back = box?.querySelector('.face-back')
  if (!box || !front || !back) {
    isFlipped.value = !isFlipped.value
    return
  }

  flipAnimating = true
  const goingToBack = !isFlipped.value
  const startAngle = isFlipped.value ? 180 : 0
  const endAngle = goingToBack ? 180 : 0
  const duration = 600
  const startTime = performance.now()

  // 设置初始状态 — ⚠️ 根据翻转方向设正确透明度
  if (goingToBack) {
    front.style.setProperty('opacity', '1', 'important')
    front.style.setProperty('visibility', 'visible', 'important')
    back.style.setProperty('opacity', '0', 'important')
    back.style.setProperty('visibility', 'hidden', 'important')
  } else {
    front.style.setProperty('opacity', '0', 'important')
    front.style.setProperty('visibility', 'hidden', 'important')
    back.style.setProperty('opacity', '1', 'important')
    back.style.setProperty('visibility', 'visible', 'important')
  }
  box.style.transform = `rotateY(${startAngle}deg)`
  box.style.webkitTransform = `rotateY(${startAngle}deg)`

  function animate(time) {
    const t = Math.min((time - startTime) / duration, 1)
    const ease = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2
    const angle = startAngle + (endAngle - startAngle) * ease
    box.style.transform = `rotateY(${angle}deg)`
    box.style.webkitTransform = `rotateY(${angle}deg)`

    // 在旋转中间点（t=0.5，容器正好 90°，两面皆侧对用户）瞬间切换透明度
    if (t >= 0.5) {
      if (goingToBack) {
        front.style.setProperty('opacity', '0', 'important')
        front.style.setProperty('visibility', 'hidden', 'important')
        back.style.setProperty('opacity', '1', 'important')
        back.style.setProperty('visibility', 'visible', 'important')
      } else {
        front.style.setProperty('opacity', '1', 'important')
        front.style.setProperty('visibility', 'visible', 'important')
        back.style.setProperty('opacity', '0', 'important')
        back.style.setProperty('visibility', 'hidden', 'important')
      }
      // 首次揭晓：在翻转过半（背面不可见时）切换背面内容
      if (!hasRevealed.value) {
        hasRevealed.value = true
      }
    }

    if (t < 1) {
      requestAnimationFrame(animate)
    } else {
      if (!goingToBack) {
        box.style.transform = ''
        box.style.webkitTransform = ''
      }
      isFlipped.value = goingToBack
      flipAnimating = false
    }
  }

  requestAnimationFrame(animate)
}

function onTiltMove(e) {
  if (!tiltActive.value || !tiltRef.value) return
  const rect = tiltRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  tiltRef.value.style.transform = `rotateX(${-y * 15}deg) rotateY(${x * 15}deg)`
}

function onTiltLeave() {
  tiltActive.value = false
  if (tiltRef.value) {
    tiltRef.value.style.transform = ''
  }
}

/* ========== 陀螺仪已移除（iOS 导致白屏 + 越转越小） ========== */

/* ========== 气泡 tooltip ========== */
function showBubbleTip(e, dimIdx) {
  // 未解锁气泡不显示信息
  if (bubbleClass(dimIdx) === 'locked') return
  const style = styleData.value
  if (!style) return
  const knowledge = KNOWLEDGE[style.id]
  if (!knowledge || !knowledge[dimIdx]) return
  tooltipText.value = knowledge[dimIdx].detail
  const rect = e.target.closest('.bubble-wrap')?.getBoundingClientRect()
  if (rect) {
    const tipW = Math.min(200, window.innerWidth - 40)
    // 始终显示在气泡上方（漂浮在卡牌图片区域）
    tooltipStyle.value = {
      left: Math.max(10, rect.left + rect.width / 2 - tipW / 2) + 'px',
      bottom: window.innerHeight - rect.top + 8 + 'px',
      maxWidth: tipW + 'px',
    }
  }
  tooltipVisible.value = true
}

function hideBubbleTip() {
  tooltipVisible.value = false
}

/* ========== 动作 ========== */
function handleCollect() {
  store.confirmNewCard()   // 触发图鉴红点
  emit('close')
}

function handleRegen() {
  store.confirmNewCard()   // 触发图鉴红点
  emit('close')
  emit('regen')
}

function deleteCard() {
  store.deleteCurrentFromGallery()
  emit('close')
}

/** 捕获卡面为图片 blob — 用 Canvas 原生绘制，避免 html2canvas 黑屏问题 */
async function captureCardBlob() {
  const imgSrc = cardImage.value
  if (!imgSrc) return null

  try {
    // 创建 Image 对象等待加载完成
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imgSrc
    })

    // 用 Canvas 绘制并导出
    // ⚠️ 不要在 drawImage 之后再设 canvas.width/height——会清空画布
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png')
    })
  } catch (e) {
    console.warn('截图失败', e)
    return null
  }
}

async function downloadCard() {
  try {
    const blob = await captureCardBlob()
    if (!blob) return

    // 优先用 Web Share API 保存到相册（移动端会弹出共享菜单含"存储到照片"）
    if (navigator.share && navigator.canShare?.({ files: [new File([blob], '非遗卡牌.png', { type: 'image/png' })] })) {
      await navigator.share({
        files: [new File([blob], '非遗卡牌.png', { type: 'image/png' })],
      })
      return
    }

    // 降级：传统的 <a download>（桌面端或 Web Share 不支持文件时）
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = '非遗卡牌.png'
    a.href = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    if (e.name !== 'AbortError') {
      store.showToast('保存失败，请尝试截图保存 📸', 'error')
    }
  }
}

async function shareCard() {
  // 移动端优先用原生 Web Share API
  const canShareFiles = navigator.share && navigator.canShare?.({ files: [new File([''], 'test.png', { type: 'image/png' })] })
  if (canShareFiles) {
    try {
      const blob = await captureCardBlob()
      await navigator.share({
        title: '非遗映像 · 我的卡牌',
        text: '我用非遗映像生成的非遗文化卡牌，来看看吧！🏮',
        files: [new File([blob], '非遗卡牌.png', { type: 'image/png' })],
      })
      return
    } catch (e) {
      if (e.name === 'AbortError') return
      // 原生分享失败，降级到海报
    }
  }
  // 桌面端或不支持文件分享：弹出精美海报
  showPoster.value = true
}

/* ========== 打开时触发动画 ========== */
watch(
  () => props.visible,
  async (v) => {
    if (v) {
      // 等待 DOM 挂载完成（v-if 从 false→true 触发 DOM 创建）
      await nextTick()
      await nextTick()
      // 再等一帧确保浏览器完成渲染
      await new Promise(r => setTimeout(r, 50))

      justRevealed.value = false
      bubblesVisible.value = false
      tooltipVisible.value = false
      flipAnimating = false
      hasRevealed.value = false

      const box = tiltRef.value?.querySelector('.flip-box')
      const front = box?.querySelector('.face-front')
      const back = box?.querySelector('.face-back')

      console.log('[CardReveal] visible=true, isFreshResult=', props.isFreshResult,
        'tiltRef=', !!tiltRef.value, 'box=', !!box, 'front=', !!front, 'back=', !!back)

      if (props.isFreshResult) {
        // 新生成结果：背面朝上显示"？"封面
        isFlipped.value = true
        if (front) {
          front.style.setProperty('opacity', '0', 'important')
          front.style.setProperty('visibility', 'hidden', 'important')
        }
        if (back) {
          back.style.setProperty('opacity', '1', 'important')
          back.style.setProperty('visibility', 'visible', 'important')
        }
        if (box) {
          box.style.transform = 'rotateY(180deg)'
          box.style.webkitTransform = 'rotateY(180deg)'
        }
      } else {
        // 图鉴查看：直接显示正面
        hasRevealed.value = true
        isFlipped.value = false
        if (front) {
          front.style.setProperty('opacity', '1', 'important')
          front.style.setProperty('visibility', 'visible', 'important')
        }
        if (back) {
          back.style.setProperty('opacity', '0', 'important')
          back.style.setProperty('visibility', 'hidden', 'important')
        }
        if (box) {
          box.style.transform = ''
          box.style.webkitTransform = ''
        }
      }

      await nextTick()
      justRevealed.value = true
      setTimeout(() => {
        bubblesVisible.value = true
      }, 600)
    }
  }
)
</script>

<style scoped>
/* ========== Overlay ========== */
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: flex-start;
  padding: 12px;
  overflow-y: auto;
}
.overlay.show { display: flex; }
.overlay-box {
  background: var(--bg-elevated);
  border-radius: 14px;
  padding: 16px;
  width: 100%;
  max-width: 360px;
  max-height: 90vh;
  overflow-y: auto;
  text-align: center;
  position: relative;
  box-sizing: border-box;
  margin-top: max(12px, 5vh);
}

.overlay-close {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 20;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s;
  line-height: 1;
  font-family: inherit;
}
.overlay-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
}
.overlay-close:active { transform: scale(0.9); }

/* 右上角分享按钮 */
.overlay-share {
  position: absolute;
  top: 6px;
  right: 40px;
  z-index: 20;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s;
  line-height: 1;
  font-family: inherit;
}
.overlay-share:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
}
.overlay-share:active { transform: scale(0.9); }
.overlay-share:disabled { opacity: 0.3; cursor: default; }

/* ========== Card Scene ========== */
.card-scene {
  -webkit-perspective: 1000px;
  perspective: 1000px;
  margin: 8px auto;
  width: 172px;
}
.card-scene.card-reveal {
  animation: cardReveal 500ms cubic-bezier(0.23, 1, 0.32, 1) both;
}
@keyframes cardReveal {
  0% { transform: translateY(40px) scale(0.95); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

.tilt-wrapper {
  width: 100%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  cursor: pointer;
}
.flip-box {
  position: relative;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  cursor: pointer;
  border-radius: 10px;
}
.flip-box.flipped {
  /* JS 驱动动画，CSS 只保留空状态 */
}
/* 卡牌投影 — 按稀有度 */
.flip-box.qingshang {
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.03);
}
.flip-box.zhenshang {
  box-shadow: 0 2px 6px rgba(168,134,42,0.10), 0 6px 14px rgba(168,134,42,0.06);
}
.flip-box.shenpin {
  box-shadow: 0 2px 8px rgba(212,168,83,0.15), 0 8px 24px rgba(212,168,83,0.10), 0 0 0 1px rgba(212,168,83,0.08);
}

/* ===== 两面共享 ===== */
.flip-face {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 10px;
  width: 100%;
}

/* ===== 正面（流式撑高） ===== */
.face-front {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  opacity: 1;
}

/* ===== 背面默认隐藏 ===== */
.face-back {
  -webkit-transform: rotateY(180deg);
  transform: rotateY(180deg);
  opacity: 0;
}
.face-front.qingshang {
  background: #fcf9f4;
  border: 1px solid #d4cdc2;
}
.face-front.zhenshang {
  background: #fdfaf0;
  border: 1px solid #d4c095;
}
.face-front.shenpin {
  background: #fcf5ec;
  border: 1.5px solid rgba(212, 168, 83, 0.35);
}

/* 纸纹纹理 */
.paper-texture {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 2;
  border-radius: 10px;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 400px 400px;
  mix-blend-mode: multiply;
}

/* 稀有度栏 */
.rarity-bar {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 5;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.06); /* 方案B · 凸起边缘感 */
}
.rarity-bar.qingshang {
  background: linear-gradient(180deg, #e5dfd5, #dcd4c8);
  color: #7a7570;
  border-bottom: 1px solid #d0c8bc;
}
.rarity-bar.zhenshang {
  background: linear-gradient(180deg, #faf1d0, #f3e6be);
  color: #9a7e28;
  border-bottom: 1px solid #e8d8a8;
}
.rarity-bar.shenpin {
  background: linear-gradient(135deg, #f5e6e0 0%, #f5e6d8 30%, #f8edd0 60%, #f5e6e0 100%);
  color: #8e2a2b;
  border-bottom: 1px solid #e8d4c0;
  text-shadow: 0 0.5px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}
.rarity-bar.shenpin .star {
  background: linear-gradient(90deg, #d4a853, #9e2a2b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.rarity-bar.shenpin::after {
  content: '';
  position: absolute;
  top: 0;
  left: -70%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 240, 200, 0.5) 30%, rgba(255, 220, 180, 0.7) 50%, rgba(255, 240, 200, 0.5) 70%, transparent 100%);
  transform: skewX(-20deg);
  animation: shenpin-shimmer 2.8s ease-in-out infinite;
  pointer-events: none;
  z-index: 5;
}
@keyframes shenpin-shimmer {
  0% { left: -70%; }
  55% { left: 120%; }
  100% { left: 120%; }
}

.rarity-label { position: relative; z-index: 6; }
.style-emoji { position: relative; z-index: 6; }

/* 卡牌图片区 */
.card-img {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 133.33%; /* 3:4 — 图片区域独立保持比例 */
  overflow: hidden;
  z-index: 1;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}
.face-front.qingshang .card-img { background: #f7f4ee; }
.face-front.zhenshang .card-img { background: linear-gradient(180deg, #fdfaf0 0%, #f8f2e4 50%, #faf4e8 100%); }
.face-front.shenpin .card-img { background: linear-gradient(180deg, #fef9f0 0%, #faf3e8 30%, #f5ebe4 70%, #fcf4ee 100%); }

.card-real-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.card-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 64px;
  color: var(--text-tertiary);
  z-index: 1;
}

.quality-glow {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 3;
}
.face-front.qingshang .quality-glow { display: none; }
.face-front.zhenshang .quality-glow {
  background: radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.04) 0%, transparent 60%);
}
.face-front.shenpin .quality-glow {
  background:
    radial-gradient(ellipse at 40% 30%, rgba(212,168,83,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 60%, rgba(158,42,43,0.03) 0%, transparent 40%);
}

/* 卡牌底栏 */
.card-footer {
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 3;
  box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.6); /* 方案B · 页脚边缘高光 */
}
.face-front.qingshang .card-footer {
  background: #f7f4ee;
  border-top: 1px solid #e0dad0;
}
.face-front.zhenshang .card-footer {
  background: #fdfaf0;
  border-top: 1px solid #ece0c4;
}
.face-front.shenpin .card-footer {
  background: linear-gradient(180deg, #fef9f0, #f8eee4);
  border-top: 1px solid #e8d4c0;
}
.card-style-name { font-weight: 600; font-size: 11px; color: var(--text-primary); }
.face-front.qingshang .card-style-name { color: #7a7570; }
.face-front.zhenshang .card-style-name { color: #9a7e28; }
.face-front.shenpin .card-style-name { color: #8e2a2b; }
.card-resonance { color: var(--text-secondary); font-size: 11px; }
.face-front.zhenshang .card-resonance { color: #b8a46a; }

/* ========== Back Face ========== */
.face-back {
  position: absolute;
  inset: 0;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}
.face-back.qingshang {
  background: linear-gradient(180deg, #f5f0e8, #ede6dc);
  border: 1px solid #d4cdc2;
}
.face-back.zhenshang {
  background: linear-gradient(180deg, #fcf6e6, #f7f0e0);
  border: 1px solid #d4c095;
}
.face-back.shenpin {
  background: linear-gradient(180deg, #faf3ea 0%, #f5ece2 30%, #f5eae8 70%, #faf0ea 100%);
  border: 1.5px solid rgba(212,168,83,0.40);
}
/* ========== 背纹装饰（参考 卡牌翻转演示.html） ========== */
.silver-ornament {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 1;
}
/* 清赏：菱形点阵银纹 */
.face-back.qingshang .silver-ornament {
  background:
    repeating-linear-gradient(45deg, transparent, transparent 16px, rgba(180,170,158,0.12) 16px, rgba(180,170,158,0.12) 17px),
    repeating-linear-gradient(-45deg, transparent, transparent 16px, rgba(180,170,158,0.12) 16px, rgba(180,170,158,0.12) 17px);
}
.face-back.qingshang .silver-ornament::before {
  content: ''; position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 60px; height: 60px;
  border: 1px solid rgba(180,170,158,0.08);
  border-radius: 50%;
}
/* 珍赏：卷草金纹 */
.face-back.zhenshang .silver-ornament {
  background:
    radial-gradient(circle at 25% 30%, rgba(212,168,83,0.05) 0%, transparent 40%),
    radial-gradient(circle at 75% 70%, rgba(212,168,83,0.05) 0%, transparent 40%);
}
.face-back.zhenshang .silver-ornament::before {
  content: ''; position: absolute;
  top: 18%; left: 8%;
  width: 84%; height: 56%;
  border: 1.5px solid rgba(212,168,83,0.09);
  border-radius: 38% 62% 42% 58%;
  transform: rotate(12deg);
}
.face-back.zhenshang .silver-ornament::after {
  content: ''; position: absolute;
  top: 26%; left: 18%;
  width: 64%; height: 40%;
  border: 1px solid rgba(212,168,83,0.13);
  border-radius: 55% 45% 48% 52%;
  transform: rotate(-8deg);
  box-shadow: 0 0 24px rgba(212,168,83,0.05), inset 0 0 24px rgba(212,168,83,0.04);
}
/* 神品：同心金纹 + 光芒 */
.face-back.shenpin .silver-ornament {
  background:
    radial-gradient(circle at 30% 20%, rgba(212,168,83,0.05) 0%, transparent 45%),
    radial-gradient(circle at 70% 80%, rgba(248,220,140,0.04) 0%, transparent 40%);
}
.face-back.shenpin .silver-ornament::before {
  content: ''; position: absolute;
  top: 12%; left: 4%;
  width: 92%; height: 68%;
  border: 1.5px solid rgba(212,168,83,0.10);
  border-radius: 42% 58% 48% 52%;
  box-shadow: 0 0 20px rgba(212,168,83,0.04), inset 0 0 30px rgba(212,168,83,0.03);
}
.face-back.shenpin .silver-ornament > div:first-child {
  position: absolute;
  top: 22%; left: 14%;
  width: 72%; height: 52%;
  border: 2px solid rgba(212,168,83,0.09);
  border-radius: 55% 45% 50% 50%;
}
.face-back.shenpin .silver-ornament > div:last-child {
  position: absolute;
  top: 32%; left: 28%;
  width: 44%; height: 30%;
  border: 1px solid rgba(212,168,83,0.12);
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, rgba(212,168,83,0.06) 0%, transparent 60%);
}
.back-rarity {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 8px;
  align-self: flex-start;
  position: relative;
  z-index: 5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06); /* 方案B · 标签凸起 */
}
.face-back.qingshang .back-rarity { background: #ddd5c9; color: #8a8580; }
.face-back.zhenshang .back-rarity { background: #f0e4c4; color: #9a8a4a; }
.face-back.shenpin .back-rarity { background: linear-gradient(135deg, #f0ded8, #f0e4cc); color: #8e2a2b; }
.back-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  text-align: left;
  margin-top: 4px;
  position: relative;
  z-index: 5;
}
.back-banner {
  width: 100%;
  height: 0;
  padding-bottom: 28%;
  overflow: hidden;
  border-radius: 4px;
  margin: 4px 0;
  position: relative;
  z-index: 5;
}
.back-banner .banner-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.back-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  text-align: left;
  flex: 1;
  position: relative;
  z-index: 5;
}
.back-source {
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: left;
  margin-top: auto;
  padding-top: 4px;
  position: relative;
  z-index: 5;
}

.back-seal {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #9e2a2b;
  border: 1px solid var(--accent-gold, #d4a853);
  padding: 2px; /* 内缩留白 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  z-index: 5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* ========== 气泡 ========== */
.bubble-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: absolute;
  bottom: 10px;
  left: 6px;
  right: 6px;
  width: auto;
  z-index: 10;
  pointer-events: auto;
}
.bubble-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bubble-col.left { align-items: flex-start; }
.bubble-col.right { align-items: flex-end; }
.bubble-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  position: relative;
}
.bubble {
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
  transition: all 0.3s;
  user-select: none;
  white-space: nowrap;
}
.bubble.locked {
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.5);
  border: none;
}
.bubble.unlocked {
  background: var(--accent);
  color: #fff;
  border: 1.5px solid var(--accent-gold);
}
.bubble.maxed {
  background: linear-gradient(135deg, var(--accent-gold), var(--accent));
  color: #fff;
  border: 1.5px solid var(--accent-gold);
}
.b-icon { font-size: 8px; }

/* pop-in animation */
.pop-in {
  animation: bubblePop 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes bubblePop {
  0% { transform: translateY(8px) scale(0.8); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

/* ========== 全局气泡 tooltip ========== */
.bubble-tip-global {
  display: none;
  position: fixed;
  z-index: 200;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 10px;
  line-height: 1.4;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 200px;
  text-align: center;
  pointer-events: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.bubble-tip-global.show { display: block; }

/* ========== 其他 ========== */
.card-hint {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 4px;
  margin-bottom: 8px;
}

.prompt-display {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 4px;
  text-align: left;
  line-height: 1.4;
  word-break: break-all;
}
.prompt-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.result-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.result-actions button {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: var(--bg-elevated);
  transition: 0.2s;
  font-family: inherit;
}
.result-actions button.primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.result-actions button:disabled {
  opacity: 0.4;
  cursor: default;
  transform: none;
}
.result-actions button:active { transform: scale(0.96); }
.result-actions button:disabled:active { transform: none; }

/* ========== 问号封面（盲盒效果） ========== */
.mystery-cover {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.mystery-question {
  font-size: 90px;
  font-weight: 800;
  color: rgba(142, 42, 43, 0.12);
  line-height: 1;
  user-select: none;
  font-family: var(--font-display);
}
.mystery-hint {
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 2px;
}
</style>
