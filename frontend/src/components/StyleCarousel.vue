<template>
  <div class="style-carousel" ref="carouselRef">
    <div
      class="carousel-track"
      ref="trackRef"
      :class="{ grabbing: isGrabbing }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      @dragstart.prevent
    >
      <div
        v-for="(s, i) in styles"
        :key="s.id"
        class="carousel-slide"
        :class="'bg-' + s.id"
        :data-index="i"
        @click="jumpToStyle(s.id)"
      >
        <!-- Netflix 式全宽海报遮罩 -->
        <div class="cs-overlay"></div>
        <!-- 顶部渐变（融入页面背景） -->
        <div class="cs-fade-top"></div>
        <!-- 内容区：左下角对齐 -->
        <div class="cs-content">
          <span class="cs-tag">{{ s.heritage }}</span>
          <span class="cs-name">{{ s.name }}</span>
          <span class="cs-desc">{{ s.desc }}</span>
          <button class="cs-btn" @click.stop="jumpToStyle(s.id)">
            选择此风格 →
          </button>
        </div>
      </div>
    </div>
    <!-- 底部进度条（替代传统圆点） -->
    <div class="carousel-progress">
      <div class="cp-fill" :style="{ width: progressWidth }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import { STYLES } from '../data/styles.js'

const store = useGameStore()
const styles = STYLES

const trackRef = ref(null)
const currentIdx = ref(0)
const isGrabbing = ref(false)
let autoTimer = null

// 进度条宽度
const progressWidth = computed(() => {
  return ((currentIdx.value + 1) / styles.length * 100) + '%'
})

// 滑动状态
const SWIPE_THRESHOLD = 50
let dragStartX = 0
let dragStartY = 0
let dragDeltaX = 0
let isDragging = false

function goTo(idx) {
  currentIdx.value = idx
  if (trackRef.value) {
    trackRef.value.style.transition = 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    trackRef.value.style.transform = `translateX(-${idx * 100}%)`
  }
}

function jumpToStyle(id) {
  store.selectStyle(id)
}

// 边界限制：首尾完全锁定
function clampDrag(dx) {
  const max = styles.length - 1
  if (currentIdx.value === 0 && dx > 0) return 0
  if (currentIdx.value === max && dx < 0) return 0
  return dx
}

/* ===== 触摸滑动 ===== */
function onTouchStart(e) {
  isGrabbing.value = true
  dragStartX = e.touches[0].clientX
  dragStartY = e.touches[0].clientY
  dragDeltaX = 0
  isDragging = false
  stopAuto()
  if (trackRef.value) trackRef.value.style.transition = 'none'
}

function onTouchMove(e) {
  const dx = e.touches[0].clientX - dragStartX
  const dy = Math.abs(e.touches[0].clientY - dragStartY)
  if (dy > 30 && Math.abs(dx) < dy) return
  if (Math.abs(dx) > 10) isDragging = true
  const clamped = clampDrag(dx)
  dragDeltaX = clamped
  if (trackRef.value) {
    trackRef.value.style.transform = `translateX(calc(-${currentIdx.value * 100}% + ${clamped}px))`
  }
}

function onTouchEnd() {
  isGrabbing.value = false
  if (!isDragging) { startAuto(); return }
  if (Math.abs(dragDeltaX) >= SWIPE_THRESHOLD) {
    const dir = dragDeltaX > 0 ? -1 : 1
    const next = Math.max(0, Math.min(styles.length - 1, currentIdx.value + dir))
    goTo(next)
  } else {
    goTo(currentIdx.value)
  }
  isDragging = false
  startAuto()
}

/* ===== 鼠标拖拽 ===== */
let mouseUpHandler = null
let mouseMoveHandler = null

function onMouseDown(e) {
  isGrabbing.value = true
  dragStartX = e.clientX
  dragDeltaX = 0
  isDragging = false
  stopAuto()
  if (trackRef.value) trackRef.value.style.transition = 'none'

  mouseMoveHandler = (ev) => {
    const dx = ev.clientX - dragStartX
    if (Math.abs(dx) > 10) isDragging = true
    const clamped = clampDrag(dx)
    dragDeltaX = clamped
    if (trackRef.value) {
      trackRef.value.style.transform = `translateX(calc(-${currentIdx.value * 100}% + ${clamped}px))`
    }
  }
  mouseUpHandler = () => {
    document.removeEventListener('mousemove', mouseMoveHandler)
    document.removeEventListener('mouseup', mouseUpHandler)
    isGrabbing.value = false
    if (!isDragging) { startAuto(); return }
    if (Math.abs(dragDeltaX) >= SWIPE_THRESHOLD) {
      const dir = dragDeltaX > 0 ? -1 : 1
      const next = Math.max(0, Math.min(styles.length - 1, currentIdx.value + dir))
      goTo(next)
    } else {
      goTo(currentIdx.value)
    }
    isDragging = false
    startAuto()
  }
  document.addEventListener('mousemove', mouseMoveHandler)
  document.addEventListener('mouseup', mouseUpHandler)
}

/* ===== 自动轮播 ===== */
function startAuto() {
  stopAuto()
  autoTimer = setInterval(() => {
    goTo((currentIdx.value + 1) % styles.length)
  }, 4000)
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer)
  autoTimer = null
}

onMounted(() => startAuto())
onUnmounted(() => stopAuto())
</script>

<style scoped>
/* ===== Netflix 式轮播容器 ===== */
.style-carousel {
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.10);
}
.carousel-track {
  display: flex;
  transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: grab;
  user-select: none;
}
.carousel-track.grabbing {
  cursor: grabbing;
}

/* ===== 全宽海报幻灯片 ===== */
.carousel-slide {
  min-width: 100%;
  height: 200px;
  position: relative;
  cursor: pointer;
  user-select: none;
  background-size: cover;
  background-position: center 20%;
}
/* 各风格背景图 */
.carousel-slide.bg-miao_silver { background-image: url('/images/苗族_古典_横版.jpg'); }
.carousel-slide.bg-court_dress { background-image: url('/images/清宫华服_古典_横版.jpg'); }
.carousel-slide.bg-dunhuang { background-image: url('/images/敦煌_艺术_横版.jpg'); }
.carousel-slide.bg-tang_dynasty { background-image: url('/images/大唐服饰_古典_横版.jpg'); }
.carousel-slide.bg-ming_brocade { background-image: url('/images/大明风华_古典_横版.jpg'); }
.carousel-slide.bg-su_embroidery { background-image: url('/images/苏州刺绣_古典_横版.jpg'); }
.carousel-slide.bg-batik { background-image: url('/images/蜡染蓝韵_古典_横版.jpg'); }
.carousel-slide.bg-blue_porcelain { background-image: url('/images/青花瓷纹_古典_横版.jpg'); }
.carousel-slide.bg-yi_costume { background-image: url('/images/彝族服饰_古典_横版.jpg'); }
.carousel-slide.bg-tibetan { background-image: url('/images/藏族文化_古典_横版.jpg'); }
.carousel-slide.bg-zhuang_brocade { background-image: url('/images/壮族壮锦_古典_横版.jpg'); }
.carousel-slide.bg-ming_style { background-image: url('/images/明式风格_古典_横版.jpg'); }

/* 主遮罩：底部深、顶部融入背景色 */
.cs-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    rgba(0, 0, 0, 0.55) 75%,
    rgba(0, 0, 0, 0.75) 100%
  );
  z-index: 1;
}
/* 顶部渐变：让图片顶部自然融入页面底色 */
.cs-fade-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(180deg, var(--bg-primary) 0%, transparent 100%);
  z-index: 2;
  pointer-events: none;
}

/* 左下角内容区 */
.cs-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 18px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.cs-tag {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}
.cs-name {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  font-family: var(--font-display);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  line-height: 1.3;
}
.cs-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  line-height: 1.4;
  margin-bottom: 2px;
}
.cs-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.cs-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}
.cs-btn:active {
  transform: scale(0.95);
}

/* ===== Netflix 式进度条 ===== */
.carousel-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  z-index: 4;
}
.cp-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0 2px 2px 0;
  transition: width 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
